
# amaroc
[![NPM version](https://img.shields.io/npm/v/amaroc.svg)](http://npmjs.com/package/amaroc)
[![Build Status](https://github.com/extremeheat/amaroc/actions/workflows/ci.yml/badge.svg)](https://github.com/extremeheat/amaroc/actions/)
[![Gitpod ready-to-code](https://img.shields.io/badge/Gitpod-ready--to--code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/extremeheat/amaroc)

CLI tool and wrapper for Node.js [`amaro`](https://github.com/nodejs/amaro) to transpile TypeScript codebases to JavaScript via type stripping (preserving line numbers).

Node.js 23 added support for TypeScript without transpilation to JS, but this doesn't work for packages in node_modules, so you still need to transpile before publish. Typically when publishing Node.js packages written in TypeScript after compiling with tsc, you need to ship JavaScript files with source maps to retain line numbers in stack traces. `amaroc` simplifies this by replacing TypeScript syntax with whitespace with `amaro` and rewriting `.ts` imports to `.js` using `jscodeshift`, all in a single command, removing the need for source maps. It’s perfect for `prepack` scripts and respects `.gitignore` for seamless use.

**Note that Node.js 23 or newer is required for TypeScript support without transpilation, but this package will work on Node.js 20+** so you can use it in release CI workflows with older Node.js versions.

## Features

- Transpiles `.ts` to `.js` with type stripping, preserving line numbers.
- Updates `import`, `require()`, and dynamic `import()` paths from `.ts` to `.js`.
- Respects `.gitignore` patterns to skip ignored files.
- Optional cleanup of original `.ts` files.
- Easy to drop in and use -- no tsconfig.json or other config required

## Install

Install as a dev dependency:

```bash
npm install -D amaroc
```

## Usage

After installing as a dev dep, it's as simple as adding this to your package.json's `prepack` to auto build before `npm publish` and on local npm installs:
```json
{
  "scripts": {
    "prepack": "amaroc"    
  }
}
```

### CLI

```bash
$ npx amaroc --help
Usage: amaroc [path] [options]

Description:
  Transpiles TypeScript (.ts) files to JavaScript (.js) files.

Arguments:
  [path]            Optional. A directory or a .ts file to transpile.
                    - If omitted, processes all .ts files in the current directory.
                    - If a directory, processes all .ts files in that directory.
                    - If a .ts file, converts only that file.

Options:
  --verbose         Enable debug logging during conversion.
  --clean           Delete original .ts files after conversion.
  --help            Display this help message.

Examples:
  amaroc                # Transpile all .ts files in current directory
  amaroc src            # Transpile all .ts files in 'src' directory
  amaroc file.ts        # Transpile 'file.ts' to 'file.js'
  amaroc --verbose      # Transpile with logging
  amaroc src --clean    # Transpile and delete original .ts files
  amaroc file.ts --verbose --clean  # Transpile single file with logging and cleanup
```

### API

You can also use `amaroc` programmatically in Node.js:

```javascript
const { convert, convertFile } = require('amaroc');

// Convert all .ts files in a directory
await convert('src', { debug: true, deleteOriginal: false });

// Convert a single file
const jsPath = convertFile('path/to/file.ts');
```

#### TypeScript Support

Type definitions are included:

```typescript
import { convert, convertFile } from 'amaroc';

convert('src', { debug: true }).then(() => console.log('Done'));
const jsPath = convertFile('path/to/file.ts');
```

See [`index.d.ts`](src/index.d.ts) for full type details.


## License

MIT License. See [LICENSE](LICENSE) for details.

## Acknowledgments

- Built on top of Node.js's [`amaro`](https://github.com/egoist/amaro) for type stripping.
- Uses Meta's [`jscodeshift`](https://github.com/facebook/jscodeshift) for AST transformations.
