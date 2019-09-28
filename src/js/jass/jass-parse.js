// 當前文件暫無用 僅用於測試語法檢測可行性

const ALLOWED_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890_-";

const bbb = ["function", "endfunction", "globals", "endglobals"]

class Col {
  constructor() {
    this.col = "";
  }

  /**
   * 
   * @param {string} str 
   */
  put(str) {
    this.col += str
  }
}

/**
 * 
 * @param {string} string 
 */
const isWhitespace = (string) => {
  return new String().trimLeft() == "";
}

/**
 * 
 * @param {string} content 
 */
const parse = (content) => {
  let inString = false;
  let inComment = false;
  let inGlobals = false;
  let inFunction = false;
  let inTakes = false;
  let inReturns = false;
  let inReturn = false;
  let inConstantNative = false;
  let inNative = false;
  let inLocal = false;
  let inType = false;
  let inExtends = false;
  let line = 0;

  for (let i = 0; i < content.length; i++) {
    let char = content.charAt(i);

    if (char == "/" && content.charAt(i + 1) == "/" && !inComment && !inString) {
      inComment = true;
      i++;
    } else if (char == "\"" && !inComment && !inString) {
      inString = true;
    } else if (char == "\"" && !inComment && inString) {
      inString = false;
    } else if (char == "\n") {
      inComment = false;
      inString = false;
      line++;
    } else if (isWhitespace(char) && !inComment && !inString) {

    }

  }

}