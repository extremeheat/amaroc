#!/usr/bin/env node
const fs = require('fs')
const { convert, convertFile } = require('./compile.js')

function showHelp () {
  console.log(`
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
`)
  process.exit(0)
}

async function main () {
  const args = process.argv.slice(2)
  let verbose = false
  let clean = false
  const positional = []

  // Parse command-line arguments
  for (const arg of args) {
    if (arg === '--verbose') {
      verbose = true
    } else if (arg === '--clean') {
      clean = true
    } else if (arg === '--help') {
      showHelp()
    } else {
      positional.push(arg)
    }
  }

  // Validate the number of positional arguments
  if (positional.length > 1) {
    console.error('Error: Too many positional arguments. Expected 0 or 1.')
    console.error('Run "node cli.js --help" for usage information.')
    process.exit(1)
  }

  // Prepare options for the compiler
  const options = { debug: verbose, deleteOriginal: clean }

  if (positional.length === 0) {
    // Default case: transpile all .ts files in the current directory
    await convert(null, options)
  } else {
    const target = positional[0]
    try {
      const stats = fs.statSync(target)
      if (stats.isDirectory()) {
        // Transpile all .ts files in the specified directory
        await convert(target, options)
      } else if (stats.isFile() && target.endsWith('.ts')) {
        // Transpile a single .ts file
        if (verbose) {
          console.log('[amaroc] Converting:', target)
        }
        const jsFilePath = await convertFile(target)
        console.log(`Converted: ${target} -> ${jsFilePath}`)
        if (clean) {
          fs.unlinkSync(target)
          if (verbose) {
            console.log('[amaroc] Deleted original TypeScript file:', target)
          }
        }
      } else {
        console.error('Error: The provided path must be a directory or a .ts file.')
        console.error('Run "node cli.js --help" for usage information.')
        process.exit(1)
      }
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.error(`Error: The path "${target}" does not exist.`)
      } else {
        console.error(`Error: ${error.message}`)
      }
      process.exit(1)
    }
  }
}

// Execute the main function and handle any errors
main().catch((error) => {
  console.error('An unexpected error occurred:', error)
  process.exit(1)
})
