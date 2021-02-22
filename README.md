# Tish

> Auf den Tisch 😎

Command operation util library in TypeScript, for those who know shell script but have been bothered with it.

NOTE: still _under active development_ for now.

## Examples

```ts
const gitAddAndCommit = (
    path: string,
    message: string,
    opts: { squash: boolean }
) => $('git add', [path])
    .then($('git commit', {
        '--message': message,
        '--squash': opts.squash
    })

if (await $('git diff --exit-code')) {
    for await (const file of $('git diff --name-only HEAD~4').stdout()) {
        await gitAddAndCommit(
            file,
            'Fix a bug',
            { squash: true }
       )
}
```

## Install

```sh
$ npm install -D tish
$ yarn add -D tish
```

Also, :v:

```ts
require('tish').$('yarn add -D tish')
```

## Points

### Totally Promise

You can do anything such as `then/catch` or `async/await/catch`.

### Multi-platform

Support for e.g. Windows, POSIX

### Optimized

Handling large data is optimized with `streams`, so that large data.

### Lazy

No child process are run unless called with `await` keyword or `then` method, even if they are chained.

## Usage

```ts
// call simply
const result = await $('echo hello')
// or
$('echo hello')
    .then(result => {})

// run sequencially
$('git add .')
    .then($('git commit -m "commit"')

// run parallel
await Promise.allSettled(
    $('git add file_a'),
    $('git add file_b'),
)

// read lines async
for await (const log of $('git log --oneline')) {
    console.log(log)
}

// pipe to/from
fs.createReadStream('file_a')
    .pipe($('gzip'))
    .pipe(fs.createWriteStream('file_b'))
```

## Roadmap

-   [ ] Enriching options, e.g. watermark, etc...
-   [ ] Support `&` operator
-   [ ] Support auto escaping for quotes, regex etc.
-   [x] Optimization with generators for large array
-   [ ] Handling stderr
-   [ ] Handling shell variable
-   [ ] Creating child instances set options by default
-   [ ] Support `set` command for shell configuration
-   [ ] Wrap thrown error by ChildProcess with a dedicated Error
-   [x] Trim output string by default when `toString`
-   [x] Implement `toNumber` and `toBoolean`
