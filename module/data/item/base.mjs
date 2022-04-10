/**
 * Merge any number of objects into a single object.
 * @param {...object} objects  Objects to be merged.
 * @returns {object}           Result of the merge.
 */
export function mergeObjects(objects) {
  return Array.from(arguments).reduce((acc, other) => foundry.utils.mergeObject(acc, other), {});
}
