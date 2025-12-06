/* eslint-disable */
const fs = require("fs");
const path = require("path");

const TOKENS_PATH = path.join(__dirname, "../../../tokens.json");
const OUTPUT_PATH = path.join(__dirname, "../src/color-map.json");

const tokens = JSON.parse(fs.readFileSync(TOKENS_PATH, "utf8"));

const flatten = (obj, prefix = "") => {
  let result = {};
  for (const key in obj) {
    if (key.startsWith("$")) continue;

    const value = obj[key];
    const newKey = prefix ? `${prefix}-${key}` : key;

    if (value.$value) {
      result[newKey] = value.$value;
    } else if (typeof value === "object") {
      Object.assign(result, flatten(value, newKey));
    }
  }
  return result;
};

// We assume 'light' mode for the default map
const lightTokens = tokens.light || tokens;
const map = flatten(lightTokens);

fs.writeFileSync(OUTPUT_PATH, JSON.stringify(map, null, 2));
console.log(`Generated color map with ${Object.keys(map).length} entries.`);
