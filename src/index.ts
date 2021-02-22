import { Command } from './command'

export * from './command'

export const $: typeof Command.create = Command.create.bind(Command)
