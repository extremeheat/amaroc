/**
 * Options for the TypeScript to JavaScript conversion process.
 */
interface ConvertOptions {
    /**
     * Enable debug logging during conversion.
     * @default false
     */
    debug?: boolean;

    /**
     * Delete original TypeScript files after conversion.
     * @default false
     */
    deleteOriginal?: boolean;
}

/**
 * Convert TypeScript files to JavaScript files in the specified directory.
 * This function processes all `.ts` files in the given root directory (or current directory if unspecified),
 * strips TypeScript types using `amaro`, updates import paths with `jscodeshift`, and writes `.js` files.
 * It respects `.gitignore` patterns to skip files that should not be processed.
 * @param root The root directory to start the conversion from. If omitted, uses the current working directory.
 * @param options Options for the conversion process.
 * @returns A promise that resolves when the conversion is complete.
 * @throws {Error} If an error occurs during the conversion process.
 */
declare function convert(root?: string, options?: ConvertOptions): Promise<void>;

/**
 * Convert a single TypeScript file to JavaScript.
 * This function reads a `.ts` file, strips TypeScript types using `amaro`, updates import paths with `jscodeshift`,
 * and writes the resulting `.js` file.
 * @param fullPath The full path to the `.ts` file to convert.
 * @returns The path to the generated `.js` file.
 * @throws {Error} If an error occurs during file reading, conversion, or writing.
 */
declare function convertFile(fullPath: string): string;
