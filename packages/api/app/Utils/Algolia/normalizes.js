/* eslint-disable import/prefer-default-export */
/**
 * Returns an array of keywords
 *
 * @param {[]} arr The keywords initial array of objects
 * @returns {string[]} The service keywords
 */
export const normalizeKeywords = (arr) => arr.map((keyword) => keyword?.term);
