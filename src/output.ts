import { Readable } from 'stream'
import * as fs from 'fs'
import * as rl from 'readline'

export class CommandOutput implements PromiseLike<string> {
    public [Symbol.toStringTag] = 'CommandOutput'

    private _stream: Readable
    private _buf: Array<Buffer>

    constructor(stream: Readable) {
        this._stream = stream
        this._buf = []
    }

    public then(): Promise<void>
    public then<T>(onFulfilled: (result: string) => T): Promise<T>
    public then<T, C>(
        onFulfilled: (result: string) => T,
        onRejected: (error: unknown) => T
    ): Promise<T | C>
    public then(
        onFulfilled?: (result: string) => any,
        onRejected?: (error: unknown) => any
    ): Promise<any> {
        return this._awaited().then(onFulfilled, onRejected)
    }

    public catch(): Promise<void>
    public catch<C>(onRejected: (error: unknown) => C): Promise<C>
    public catch(onRejected?: (error: unknown) => any): Promise<any> {
        return this._awaited().catch(onRejected)
    }

    public finally(onFinally?: () => void) {
        return this._awaited().finally(onFinally)
    }

    get [Symbol.asyncIterator]() {
        return rl.createInterface({
            input: this._stream,
            crlfDelay: Infinity,
        })[Symbol.asyncIterator]
    }

    redirect(filePath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this._stream
                .pipe(fs.createWriteStream(filePath))
                .once('end', resolve)
                .once('error', reject)
        })
    }

    private _push = (chunk: Buffer) => {
        this._buf.push(chunk)
    }

    private _awaited(): Promise<string> {
        return new Promise((resolve, reject) =>
            this._stream
                .on('data', this._push)
                .once('end', () => {
                    this._stream.off('data', this._push)
                    const str = Buffer.concat(this._buf).toString().trim()
                    resolve(str)
                })
                .once('error', (err) => {
                    this._stream.off('data', this._push)
                    reject(err)
                })
        )
    }
}
