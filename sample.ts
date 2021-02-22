import fs from 'fs'
import stream from 'stream'

type Command = stream.Duplex & {}

function $(...args: any): Command {}

// const $ = shell({ throwOnError: true })

async function main() {
    $('echo hello').and('echo world').pipe('sed "s/world/世界/"')

    $('echo hello').pipe(fs.createWriteStream('aaa'))

    fs.createReadStream('a').pipe($('cat'))

    if ($('echo 111')) {
    }

    // for await ($('aaa')) {

    // }

    $('adsf')?.then($('asdf')).catch($('adsf'))

    if ($('asdf')) {
        console.log('========')
    }

    const shell = new Shell()
    const { $ } = shell({
        env: {},
        cwd: {},
    })

    // Subshell?
    $.sub({})

    // Conditional args
    $('asdf', {
        '--asdf': !something,
        '-n': something && 2,
    })

    $('echo aaaa').then(({ status, command }) => {})
}
