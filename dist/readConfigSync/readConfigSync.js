"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readConfigSync = void 0;
const tslib_1 = require("tslib");
const castArray_1 = tslib_1.__importDefault(require("lodash/castArray"));
const isEmpty_1 = tslib_1.__importDefault(require("lodash/isEmpty"));
const merge_1 = tslib_1.__importDefault(require("lodash/merge"));
const fs_1 = require("fs");
const path_1 = require("path");
const DEFAULT_CONFIG_FILE = 'gpt-config.json';
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
function readConfigSync(filePath, namedExtends) {
    const CONFIG_FILE_PATH = `${filePath}/${DEFAULT_CONFIG_FILE}`;
    const content = JSON.parse((0, fs_1.readFileSync)(CONFIG_FILE_PATH, 'utf-8'));
    if ((0, isEmpty_1.default)(content.extends)) {
        return content;
    }
    const unmerged = [];
    for (let path of (0, castArray_1.default)(content.extends)) {
        if (namedExtends) {
            const extendsValue = namedExtends[path];
            if (extendsValue) {
                path = extendsValue;
            }
        }
        unmerged.push(readConfigSync((0, path_1.resolve)((0, path_1.dirname)(filePath), path), namedExtends));
    }
    return (0, merge_1.default)({}, ...unmerged, content);
}
exports.readConfigSync = readConfigSync;
