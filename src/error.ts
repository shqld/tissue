import { Command } from './command'
import type { CommandResult } from './result'

export class CommandError extends Error implements CommandResult {
    status: number
    command: Command

    constructor(result: CommandResult) {
        super('Command Failed')

        this.status = result.status
        this.command = result.command
    }
}

CommandError.prototype.name = 'CommandError'
