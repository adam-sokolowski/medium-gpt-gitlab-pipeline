import castArray from 'lodash/castArray';
import isEmpty from 'lodash/isEmpty';
import merge from 'lodash/merge';

import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';

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
export function readConfigSync<T>(
  filePath: string,
  namedExtends?: { [id: string]: string },
): T {
  const CONFIG_FILE_PATH = `${filePath}/${DEFAULT_CONFIG_FILE}`;
  const content = JSON.parse(readFileSync(CONFIG_FILE_PATH, 'utf-8')) as T & {
      extends?: string | string[];
    };

  if (isEmpty(content.extends)) {
    return content;
  }

  const unmerged: T[] = [];
  for (let path of castArray<string>(content.extends)) {
    if (namedExtends) {
      const extendsValue = namedExtends[path];

      if (extendsValue) {
        path = extendsValue;
      }
    }

    unmerged.push(readConfigSync<T>(resolve(dirname(filePath), path), namedExtends));
  }

  return merge({}, ...unmerged, content);
}
