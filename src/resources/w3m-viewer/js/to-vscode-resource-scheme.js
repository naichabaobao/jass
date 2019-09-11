/**
 * @param {string} string
 */
const toVscodeScheme = (string) => {
  return string.replace(/\w+:/, "vscode-resource")
}