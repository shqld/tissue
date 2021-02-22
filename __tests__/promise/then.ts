import { $ } from '../../src'
import { MockProcess } from '../../src/__mock__/process'
import { MockWritable } from '../lib/mock-stream'

process.on('unhandledRejection', console.error)

describe('chain', () => {
    describe('then', () => {
        it('resolved', () => {
            const proc = new MockProcess({
                status: 200,
                stdout: 'Hello, world.',
            })

            const command = $(proc)

            const spies = {
                command: {
                    push: jest.spyOn(command, 'push'),
                },
                proc: {
                    stdout: {
                        push: jest.spyOn(proc.stdout, 'push'),
                    },
                },
            }

            return command.then(() => {
                expect(command.destroyed).toBe(true)
            })
        })
    })
})
