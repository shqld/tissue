import * as rl from 'readline'
import { Duplex, DuplexOptions } from 'stream'

import spawn from 'cross-spawn'
import classnames from 'classnames'
import type { ClassValue } from 'classnames/types'

import { Process } from './process'
import { CommandOutput } from './output'
import type { CommandResult } from './result'
import { CommandError } from './error'

export type Options = Partial<{
    cwd: string
    env: Record<string, string>
    timeout: number
    stream: DuplexOptions
}>

const defaultOptions: Options = Object.freeze({
    env: undefined,
    cwd: undefined,
    timeout: undefined,
})

export class Command extends Duplex implements PromiseLike<CommandResult> {
    public [Symbol.toStringTag] = 'Command'

    protected proc: Process

    private readonly _id: number
    private readonly _command: string

    static create(command: string | Process, options?: Options): Command
    static create(command: string | Process, args: Array<ClassValue>, options?: Options): Command
    static create(command: string | Process, ...ctorArgs: Array<unknown>): Command {
        const options = ctorArgs.pop() as Options
        const args = ctorArgs.pop() as Array<ClassValue>

        if (args) {
            command += ' '
            command += classnames(args)
        }

        return new Command(command, options)
    }

    constructor(command: string | Process, options?: Options) {
        super(options?.stream)

        options = { ...defaultOptions, ...options }

        if (typeof command === 'string') {
            const [name, ...args] = command.split(' ')

            this.proc = spawn(name, args, {
                stdio: 'pipe',
                cwd: options.cwd,
                env: options.env,
                timeout: options.timeout,
                shell: true,
            })
            this._command = command
        } else {
            this.proc = command
            this._command = this.proc.spawnfile + this.proc.spawnargs.join(' ')
        }

        this._id = this.proc.pid

        if (this.proc.stdin) {
            this.once('unpipe', () => {
                this.proc.stdin!.end()
            })
            this.once('end', () => {
                this.proc.stdin!.end()
            })
        }

        if (this.proc.stdout) {
            // this.proc.stdout = clonable(this.proc.stdout)
            this.proc.stdout.on('data', (data) => {
                this.push(data)
            })
            this.proc.stdout.once('end', () => {
                this.push(null)
            })
        }

        if (this.proc.stderr) {
            // this.proc.stderr = clonable(this.proc.stderr)
        }
    }

    public [Symbol.asyncIterator](): AsyncIterableIterator<string> {
        return rl
            .createInterface({
                input: this,
                crlfDelay: Infinity,
            })
            [Symbol.asyncIterator]()
    }

    // public pipe<T extends Command | NodeJS.WritableStream>(destination: T): T {
    //     return super.pipe(destination) as T
    // }

    public stdout(): CommandOutput | undefined {
        return this.proc.stdout ? new CommandOutput(this.proc.stdout) : undefined
    }
    public stderr(): CommandOutput | undefined {
        return this.proc.stderr ? new CommandOutput(this.proc.stderr) : undefined
    }

    public then(): Promise<void>
    public then<T>(onFulfilled: (result: CommandResult) => T): Promise<T>
    public then<T, C>(
        onFulfilled: (result: CommandResult) => T,
        onRejected: (error: unknown | CommandError) => T
    ): Promise<T | C>
    public then(
        onFulfilled?: (result: CommandResult) => any,
        onRejected?: (error: unknown | CommandError) => any
    ): Promise<any> {
        return this._awaited.then(onFulfilled, onRejected)
    }

    public catch(): Promise<void>
    public catch<C>(onRejected: (error: unknown | CommandError) => C): Promise<C>
    public catch(onRejected?: (error: unknown | CommandError) => any): Promise<any> {
        return this._awaited.catch(onRejected)
    }

    public finally(onFinally?: () => void) {
        return this._awaited.finally(onFinally)
    }

    public _read(size: number): void {}

    public _write(
        chunk: any,
        encoding: BufferEncoding,
        done: (error: Error | null | undefined) => void
    ): void {
        this.proc.stdin?.write(chunk, encoding, done)
    }

    private _promise: Promise<CommandResult> | undefined
    private get _awaited() {
        return (this._promise ??= new Promise((resolve, reject) => {
            this.proc.on('exit', (status) => {
                if (typeof status !== 'number') {
                    throw new Error('Command exited unsuccessfully')
                }

                const result = {
                    status,
                    command: this,
                }

                if (status === 0) {
                    resolve(result)
                } else {
                    reject(new CommandError(result))
                }
            })
        }))
    }
}
