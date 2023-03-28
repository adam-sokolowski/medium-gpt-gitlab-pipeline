/**
 * Retrieve a JSON file synchronously. Supports `extends` with one or many existing JSON files.
 *
 * @template T
 * @param {string} filePath path to a JSON file.
 * @param {{ [id: string]: string }} [namedExtends] A key value pair of named extends paths.
 *
 * @example
 *
 * const content = readConfigSync("local-config.json", named);
 * @returns {T}
 */
export declare function readConfigSync<T>(filePath: string, namedExtends?: {
    [id: string]: string;
}): T;
