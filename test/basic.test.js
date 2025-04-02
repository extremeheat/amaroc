/* eslint-env mocha */
const assert = require('assert')
const fs = require('fs')
const path = require('path')
const glob = require('glob')
const lib = require('amaroc') // Contains { convert, convertFile }
const MOCK_DATA_PATH = path.join(__dirname, '../src/mock-ts/')
const EXPECTED_DATA_PATH = path.join(__dirname, './expected-js/')

console.log('Mock data path:', MOCK_DATA_PATH)
console.log('Expected data path:', EXPECTED_DATA_PATH)

// Helper function to normalize line endings
function normalizeLineEndings (text) {
  return text.replace(/\r\n/g, '\n')
}

describe('basic', () => {
  it('should convert .ts files to .js correctly', async () => {
    // Run the convert function on MOCK_DATA_PATH
    await lib.convert(MOCK_DATA_PATH, { debug: false, deleteOriginal: false })

    // Find all generated .js files in MOCK_DATA_PATH
    const generatedFiles = glob.sync('**/*.js', { cwd: MOCK_DATA_PATH })

    // Compare each generated file with the corresponding expected file
    for (const relPath of generatedFiles) {
      const generatedFile = path.join(MOCK_DATA_PATH, relPath)
      const expectedFile = path.join(EXPECTED_DATA_PATH, relPath)

      // Read the contents of both files (trimEnd to handle git line endings)
      const generatedContent = fs.readFileSync(generatedFile, 'utf8').trimEnd()
      const expectedContent = fs.readFileSync(expectedFile, 'utf8').trimEnd()

      // Normalize line endings
      const normalizedGenerated = normalizeLineEndings(generatedContent)
      const normalizedExpected = normalizeLineEndings(expectedContent)

      // Assert that the contents match
      assert.strictEqual(
        normalizedGenerated,
        normalizedExpected,
        `Mismatch in ${relPath}`
      )
    }
  })
})
