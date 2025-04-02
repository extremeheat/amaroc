const fs = require('fs')
const path = require('path')
const amaro = require('amaro')
const { glob } = require('glob')
const ignore = require('ignore')
const jscodeshift = require('jscodeshift')

function convertImports (code) {
  const j = jscodeshift
  const root = j(code)

  // Helper function to update import paths
  const replaceTsWithJs = (value) => {
    if (typeof value !== 'string') return value
    if (value.startsWith('./') || value.startsWith('../')) {
      if (value.endsWith('.ts')) {
        return value.replace(/\.ts$/, '.js')
      } else if (!/\.[a-zA-Z0-9]+$/.test(value)) {
        // No extension, assume it’s a .ts file being converted, append .js
        return value + '.js'
      }
    }
    return value // Non-relative imports (e.g., 'react') are unchanged
  }

  // Update standard import declarations
  root.find(j.ImportDeclaration).forEach((path) => {
    path.node.source.value = replaceTsWithJs(path.node.source.value)
  })

  // Update dynamic import() expressions
  root.find(j.ImportExpression).forEach((path) => {
    const source = path.node.source
    if (source.type === 'Literal' && typeof source.value === 'string') {
      source.value = replaceTsWithJs(source.value)
    }
  })

  // Update require() calls
  root.find(j.CallExpression, { callee: { name: 'require' } }).forEach((path) => {
    const arg = path.node.arguments[0]
    if (arg.type === 'Literal' && typeof arg.value === 'string') {
      arg.value = replaceTsWithJs(arg.value)
    }
  })

  // Return the modified code as a string
  return root.toSource()
}

/**
 * @description Convert TypeScript to JavaScript.
 * This function converts TypeScript files to JavaScript files in the specified directory.
 * It uses the `amaro` library to perform the conversion and `jscodeshift` to update import paths.
 * It also respects `.gitignore` patterns to skip files that should not be processed.
 * @param {string} root - The root directory to start the conversion from
 * @param {object} options - Options for the conversion
 * @param {boolean} options.debug - Enable debug logging
 * @param {boolean} options.deleteOriginal - Delete original TypeScript files after conversion
 * @returns {Promise<void>}
 * @throws {Error} If an error occurs during the conversion process
 */
async function convert (root, options = {}) {
  const cwd = process.cwd()
  if (root) process.chdir(root)
  const log = options.debug ? dlog : () => {}
  try {
    // Read .gitignore if it exists
    const gitignore = ignore()
    const gitignorePath = path.join(process.cwd(), '.gitignore')

    try {
      const gitignoreContent = await fs.readFile(gitignorePath, 'utf8')
      gitignore.add(gitignoreContent)
    } catch (error) {
      log('No .gitignore found, proceeding without ignore patterns')
    }

    // Use glob to find all .ts files
    const files = await glob('**/*.ts', {
      cwd: process.cwd(),
      ignore: ['node_modules/**'], // Default ignore
      dot: true // Include dotfiles
    })

    log('Starting TypeScript to JavaScript conversion...')

    for (const file of files) {
      // Skip .d.ts files
      if (file.endsWith('.d.ts')) {
        log(`Skipping declaration file: ${file}`)
        continue
      }
      const fullPath = path.join(process.cwd(), file)
      const relativePath = path.relative(process.cwd(), fullPath)

      // Skip if path matches .gitignore patterns
      if (gitignore.ignores(relativePath)) {
        continue
      }

      try {
        const jsFilePath = await convertFile(fullPath)
        log(`Converted: ${relativePath} -> ${path.relative(process.cwd(), jsFilePath)}`)
        if (options.deleteOriginal) {
          fs.unlinkSync(fullPath)
          log(`Deleted original TypeScript file: ${relativePath}`)
        }
      } catch (error) {
        console.error(`Error converting ${relativePath}: ${error.message}`)
      }
    }

    log('Conversion completed!')
  } catch (error) {
    console.error('[amaroc] Error compiling:', error.message)
  } finally {
    // Change back to the original working directory
    process.chdir(cwd)
  }
}

async function convertFile (fullPath) {
  const tsContent = fs.readFileSync(fullPath, 'utf8')
  const result = amaro.transformSync(tsContent, {
    mode: 'strip-only'
  })
  const convertedCode = convertImports(result.code)
  // Create new filename with .js extension
  const jsFilePath = fullPath.replace(/\.ts$/, '.js')
  // Write the converted JavaScript file (synchronously)
  fs.writeFileSync(jsFilePath, convertedCode, 'utf8')
  // Return the converted code for further processing if needed
  return jsFilePath
}

function dlog (...info) {
  console.log('[amaroc]', ...info)
}

// Run the conversion
if (require.main === module) convert()
module.exports = { convert, convertFile }
