/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ["next/core-web-vitals"],
  rules: {
    "react/no-unescaped-entities": "off",
  },
  ignorePatterns: ["node_modules/", ".next/", "out/", "scripts/*.mjs"],
};
