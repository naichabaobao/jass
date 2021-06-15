import { is0_16, is0_7, is1_9, isLetter, isNewLine, isNotNewLine, isNumber, isSpace } from "../tool";
import { Location } from "./range";

type TokenType = "id" | "op" | "int" | "real" | "string" | "mark" | "error" | "block_comment" | "comment" | "macro";

class Token {
	public type: TokenType;
	public value: string;
	public line: number;
	public position: number;

	constructor(type: TokenType, value: string, line: number, position: number) {
		this.type = type;
		this.value = value;
		this.line = line;
		this.position = position;
	}

	public isId() {
		return this.type === "id";
	}
	public isOp() {
		return this.type === "op";
	}
	public isInt() {
		return this.type === "int";
	}
	public isReal() {
		return this.type === "real";
	}
	public isString() {
		return this.type === "string";
	}
	public isMark() {
		return this.type === "mark";
	}
	public isError() {
		return this.type === "error";
	}

  public isMacro() {
    return this.type === "macro";
  }
  public isComment() {
    return this.type === "comment";
  }
  public isBlockComment() {
    return this.type === "block_comment";
  }
  public isNewLine() {
    return this.isOp() && this.value == "\n";
  }


	public get end(): number {
		return this.position + this.value.length;
	}


}

/**
 * @deprecated
 */
class VToken {
  public type: string;
  public value: string;
  public loc: Location = new Location();
  constructor(type: string, value: string) {
    this.type = type;
    this.value = value;
  }
  public isId() {
    return this.type === "id";
  }
  public isOp() {
    return this.type === "op";
  }
  public isInt() {
    return this.type === "int";
  }
  public isReal() {
    return this.type === "real";
  }
  public isString() {
    return this.type === "string";
  }
  public isComment() {
    return this.type === "comment";
  }
  public isBlockComment() {
    return this.type === "block_comment";
  }
  public isMacro() {
    return this.type === "macro";
  }
  public isOther() {
    return this.type === "other";
  }

}

function _isLetter(char:string):boolean {
  if (!char) {
    return false;
  }
  return /[a-zA-Z]/.test(char);
}

function _isNumerical(char:string):boolean {
  if (!char) {
    return false;
  }
  return /\d/.test(char);
}

function _isNumerical_0_7(char:string):boolean {
  return ["0", "1", "2", "3", "4", "5", "6", "7"].includes(char);
}

function _isNumerical_16(char:string):boolean {
  if (!char) {
    return false;
  }
  return _isNumerical(char) || /[a-fA-F]/.test(char);
}

function _isIdentifier(char:string):boolean {
  if (!char) {
    return false;
  }
  return _isLetter(char) || _isNumerical(char) || char === "_";
}

function _isSpace(char:string):boolean {
  if (!char) {
    return false;
  }
  return /\s/.test(char);
}

/**
 * @deprecated
 * @param content 
 * @returns 
 */
function tokenize(content:string):VToken[] {

  const tokens:VToken[] = [];
  const lines:Array<Array<string>> = content.replace(/\r\n/g, "\n").split("\n").map((line, index, lines) => {
    return index === lines.length - 1 ? Array.from(line) : Array.from(line).concat("\n");
  });
  const values:string[] = [];
  let inBlockComment:boolean = false;

  let startLine:number = 0;
  let startPosition:number = 0;
  function pushBlockComment (endLine:number, endPosition:number) {
    const token = new VToken("block_comment",values.join(""));
    token.loc = new Location;
    token.loc.startLine = startLine;
    token.loc.startPosition = startPosition;
    token.loc.endLine = endLine;
    token.loc.endPosition = endPosition;
    tokens.push(token);
    values.length = 0;
  }
  function pushToken (type:string, startLine:number, startPosition:number, endLine:number, endPosition:number) {
    const token = new VToken(type, values.join(""));
    token.loc = new Location;
    token.loc.startLine = startLine;
    token.loc.startPosition = startPosition;
    token.loc.endLine = endLine;
    token.loc.endPosition = endPosition;
    tokens.push(token);
    values.length = 0;
  }
  lines.forEach((lineChars, lineCount, lines) => {
    for (let position = 0; position < lineChars.length;/*position++*/) {
      const char = lineChars[position];
      function nextChar () {
        return lineChars[position + 1];
      }

      function nextReal(pos:number) {
        const cur = lineChars[pos];
        if (_isNumerical(cur)) {
          values.push(cur);
          position++;
          nextReal(pos + 1);
        } else {
          pushToken("real", startLine, startPosition, lineCount, position);
        }
      }

      // const next_char = lineChars[position + 1];
      if (inBlockComment) {
        values.push(char);
        if (char === "*") {
          if (nextChar() === "/") {
            values.push(nextChar());
            position += 2;
            inBlockComment = false;
            pushBlockComment(lineCount, position);
          } else {
            position++;
          }
        } else {
          // values.push(char);
          position++;
        }
      } else if (char === "/") {
        values.push(char);
        if (!inBlockComment && nextChar() === "*") {
          startLine = lineCount;
          startPosition = position;
          values.push(nextChar());
          inBlockComment = true;
          position += 2;
        } else if (nextChar() === "/") {
          startLine = lineCount;
          startPosition = position;
          values.push(nextChar());
          position += 2;
          function next(pos:number) {
            const cur = lineChars[pos];
            if (cur) {
              values.push(cur);
              position++;
              next(pos + 1);
            } else {
              pushToken("comment", startLine, startPosition, lineCount, position);
            }
          }
          next(position);
        } else {
          startLine = lineCount;
          startPosition = position;
          position++;
          pushToken("op", startLine, startPosition, lineCount, position);
        }
      } else if (char === "#") {
        function next(pos:number) {
          const cur = lineChars[pos];
          if (cur) {
            values.push(cur);
            position++;
            next(pos + 1);
          } else {
            pushToken("macro", startLine, startPosition, lineCount, position);
          }
        }
        next(position);
      } else if (char === "\"") {
        startLine = lineCount;
        startPosition = position;
        values.push(char);
        position++;

        let inIsm = false;
        function next(pos:number) {
          const cur = lineChars[pos];
          if (cur === "\"") {
            values.push(cur);
            position++;
            if (inIsm) {
              inIsm = false;
              next(pos + 1);
            } else {
              pushToken("string", startLine, startPosition, lineCount, position);
            }
          } else if (cur === "\\") {
            inIsm = !inIsm;
            values.push(cur);
            position++;
            next(pos + 1);
          } else if (!cur) {
            pushToken("unclose_string", startLine, startPosition, lineCount, position);
          } else {
            if (inIsm) {
              inIsm = false;
            }
            values.push(cur);
            position++;
            next(pos + 1);
          }
        }
        next(position);
      } else if (_isLetter(char)) {
        startLine = lineCount;
        startPosition = position;
        values.push(char);
        position++;
        function next(pos:number) {
          const cur = lineChars[pos];
          if (_isIdentifier(cur)) {
            values.push(cur);
            position++;
            next(pos + 1);
          } else {
            pushToken("id", startLine, startPosition, lineCount, position);
          }
        }
        next(position);
      } else if (char === "0") {
        startLine = lineCount;
        startPosition = position;
        values.push(char);
        if (nextChar() === ".") {
          values.push(nextChar());
          position += 2;
          function next(pos:number) {
            const cur = lineChars[pos];
            if (_isNumerical(cur)) {
              values.push(cur);
              position++;
              next(pos + 1);
            } else {
              pushToken("real", startLine, startPosition, lineCount, position);
            }
          }
          next(position);
        } else if (nextChar() === "x") {
          values.push(nextChar());
          if (_isNumerical_16(lineChars[position + 2])) {
            values.push(lineChars[position + 2]);
            position += 3;
            function next(pos:number) {
              const cur = lineChars[pos];
              if (_isNumerical_16(cur)) {
                values.push(cur);
                position++;
                next(pos + 1);
              } else {
                pushToken("hex", startLine, startPosition, lineCount, position);
              }
            }
            next(position);
          } else {
            position += 2;
            pushToken("error_hex", startLine, startPosition, lineCount, position);
          }
        } else if (_isNumerical_0_7(nextChar())) {
          values.push(nextChar());
          position += 2;
          function next(pos:number) {
            const cur = lineChars[pos];
            if (_isNumerical_0_7(cur)) {
              values.push(cur);
              position++;
              next(pos + 1);
            } else {
              pushToken("oct", startLine, startPosition, lineCount, position);
            }
          }
          next(position);
        } else {
          position++;
          pushToken("int", startLine, startPosition, lineCount, position);
        }
      } else if (_isNumerical(char) /* 不包含0,1-9 */) {
        startLine = lineCount;
        startPosition = position;
        values.push(char);

        

        if (nextChar() === ".") {
          values.push(nextChar());
          position += 2;
          nextReal(position);
        } else if (_isNumerical(nextChar())) {
          values.push(nextChar());
          position += 2;
          
          function next(pos:number) {
            const cur = lineChars[pos];
            if (cur === ".") {
              values.push(cur);
              position++;
              nextReal(pos + 1);
            }else if (_isNumerical(cur)) {
              values.push(cur);
              position++;
              next(pos + 1);
            } else {
              pushToken("int", startLine, startPosition, lineCount, position);
            }
          }
          next(position);
        } else {
          position++;
          pushToken("int", startLine, startPosition, lineCount, position);
        }
      } else if (char === ".") {
        startLine = lineCount;
        startPosition = position;
        values.push(char);

        if (_isNumerical(nextChar())) {
          values.push(nextChar());
          position += 2;

          nextReal(position);
        } else {
          position++;
          pushToken("op", startLine, startPosition, lineCount, position);
        }
      } else if (char === "'") {
        startLine = lineCount;
        startPosition = position;
        values.push(char);
        position++;

        function next(pos:number) {
          const cur = lineChars[pos];
          if (cur === "'") {
            values.push(cur);
            position++;
            pushToken("code", startLine, startPosition, lineCount, position);
          }else if (_isNumerical(cur) || _isLetter(cur)) {
            values.push(cur);
            position++;
            next(pos + 1);
          } else {
            pushToken("unclose_code", startLine, startPosition, lineCount, position);
          }
        }
        next(position);
      } else if (char === "$") {
        startLine = lineCount;
        startPosition = position;
        values.push(char);
        
        if (_isNumerical_16(nextChar())) {
          values.push(nextChar());
          position += 2;
          function next(pos:number) {
            const cur = lineChars[pos];
            if (_isNumerical_16(cur)) {
              values.push(cur);
              position++;
              next(pos + 1);
            } else {
              pushToken("hex", startLine, startPosition, lineCount, position);
            }
          }
          next(position);
        } else {
          position++;
          pushToken("error_hex", startLine, startPosition, lineCount, position);
        }
      } else if (char === "=") {
        startLine = lineCount;
        startPosition = position;
        values.push(char);
        if (nextChar() === "=") {
          values.push(nextChar());
          position += 2;
          pushToken("op", startLine, startPosition, lineCount, position);
        } else {
          position++;
          pushToken("op", startLine, startPosition, lineCount, position);
        }
      }else if (char === "-") {
        startLine = lineCount;
        startPosition = position;
        values.push(char);
        if (nextChar() === ">") {
          values.push(nextChar());
          position += 2;
          pushToken("op", startLine, startPosition, lineCount, position);
        } else {
          position++;
          pushToken("op", startLine, startPosition, lineCount, position);
        }
      }else if (char === ">") {
        startLine = lineCount;
        startPosition = position;
        values.push(char);
        if (nextChar() === "=") {
          values.push(nextChar());
          position += 2;
          pushToken("op", startLine, startPosition, lineCount, position);
        } else {
          position++;
          pushToken("op", startLine, startPosition, lineCount, position);
        }
      }else if (char === "<") {
        startLine = lineCount;
        startPosition = position;
        values.push(char);
        if (nextChar() === "=") {
          values.push(nextChar());
          position += 2;
          pushToken("op", startLine, startPosition, lineCount, position);
        } else {
          position++;
          pushToken("op", startLine, startPosition, lineCount, position);
        }
      }else if (char === "!") {
        startLine = lineCount;
        startPosition = position;
        values.push(char);
        if (nextChar() === "=") {
          values.push(nextChar());
          position += 2;
          pushToken("op", startLine, startPosition, lineCount, position);
        } else {
          position++;
          pushToken("op", startLine, startPosition, lineCount, position);
        }
      }else if (char === "|") {
        startLine = lineCount;
        startPosition = position;
        values.push(char);
        if (nextChar() === "|") {
          values.push(nextChar());
          position += 2;
          pushToken("op", startLine, startPosition, lineCount, position);
        } else {
          position++;
          pushToken("other", startLine, startPosition, lineCount, position);
        }
      }else if (char === "&") {
        startLine = lineCount;
        startPosition = position;
        values.push(char);
        if (nextChar() === "&") {
          values.push(nextChar());
          position += 2;
          pushToken("op", startLine, startPosition, lineCount, position);
        } else {
          position++;
          pushToken("other", startLine, startPosition, lineCount, position);
        }
      }else if (char === "+" || char === "*" || char === "(" || char === ")" || char === "{" || char === "}" || char === "[" || char === "]" || char === "," || char === ";" || char === "%") {
        startLine = lineCount;
        startPosition = position;
        values.push(char);
        position++;
        pushToken("op", startLine, startPosition, lineCount, position);
      }/* else if (char === "\n") {
        startLine = lineCount;
        startPosition = position;
        values.push(char);
        position++;
        pushToken("new_line", startLine, startPosition, lineCount, position);
      } */else if (_isSpace(char)) {
        position++;
      } else {
        startLine = lineCount;
        startPosition = position;
        position++;
        values.push(char);
        position++;
        pushToken("other", startLine, startPosition, lineCount, position);
      }
    }

  });
  return tokens;
}

function tokens (content: string) {
  const tokens: Token[] = [];

	let lineNumber = 0;
	let position = 0;
	let state = 0;
	const next = (index: number) => {
		return content[index + 1];
	}
	const values: string[] = [];
	const push = (char: string) => {
		values.push(char);
	}
	const pushToken = (type: TokenType) => {
		const value = values.join("");
		tokens.push(new Token(type, value, lineNumber, position - value.length + 1)); // 因为position还未向前，所以要+1
		values.length = 0;
		if (state != 0) {
			state = 0;
		}
	}
	const bad = () => {
		pushToken("error");
	}

	// +-*/\"|&>=!<;,()[]{}
	for (let index = 0; index < content.length; index++) {
		const char = content[index];
		const nextChar = next(index);

		if (state == 0) {
      if (char == "/") {
        push(char);
        if (nextChar && nextChar == "/") {
          state = 20;
        } else if (nextChar && nextChar == "*") {
          state = 21;
        } else {
          pushToken("op");
        }
      } else if (isLetter(char)) {
				push(char);
				if (nextChar && isLetter(nextChar) || nextChar == "_" || isNumber(nextChar)) {
					state = 1;
				} else {
					pushToken("id");
				}
			} else if (char == "0") {
				push(char);
				if (nextChar && is0_7(nextChar)) {
					state = 2;
				} else if (nextChar && nextChar == "x") {
					state = 3;
				} else if (nextChar && nextChar == ".") {
					state = 9;
				} else {
					pushToken("int");
				}
			} else if (char == "\"") {
				push(char);
				if (nextChar && nextChar == "\"") {
					state = 4;
				} else if (nextChar && nextChar == "\\") {
					state = 5
				} else if (nextChar && isNotNewLine(nextChar)) {
					state = 6;
				} else {
					bad();
				}
			} else if (is1_9(char)) {
				push(char);
				if (nextChar && isNumber(nextChar)) {
					state = 8;
				} else if (nextChar && nextChar == ".") {
					state = 9;
				} else {
					pushToken("int");
				}
			} else if (char == ".") {
				push(char);
				if (nextChar && isNumber(nextChar)) {
					state = 10;
				} else {
					pushToken("op");
				}
			} else if (char == "+") {
				push(char);
				pushToken("op");
			} else if (char == "-") {
				push(char);
				if (nextChar && nextChar == ">") {
					state = 11;
				} else {
					pushToken("op");
				}
			} else if (char == "*") {
				push(char);
				pushToken("op");	
			} else if (char == "=") {
				push(char);
				if (nextChar && nextChar == "=") {
					state = 12;
				} else {
					pushToken("op");
				}
			} else if (char == ">") {
				push(char);
				if (nextChar && nextChar == "=") {
					state = 13;
				} else {
					pushToken("op");
				}
			} else if (char == "<") {
				push(char);
				if (nextChar && nextChar == "=") {
					state = 14;
				} else {
					pushToken("op");
				}
			} else if (char == "|") {
				push(char);
				if (nextChar && nextChar == "|") {
					state = 15;
				} else {
					bad();
				}
			} else if (char == "&") {
				push(char);
				if (nextChar && nextChar == "&") {
					state = 16;
				} else {
					bad();
				}
			} else if (char == "!") {
				push(char);
				if (nextChar && nextChar == "=") {
					state = 17;
				} else {
					pushToken("op");
				}
			} else if (char == "(") {
				push(char);
				pushToken("op");
			} else if (char == ")") {
				push(char);
				pushToken("op");
			} else if (char == "[") {
				push(char);
				pushToken("op");
			} else if (char == "]") {
				push(char);
				pushToken("op");
			} else if (char == "{") {
				push(char);
				pushToken("op");
			} else if (char == "}") {
				push(char);
				pushToken("op");
			} else if (char == ",") {
				push(char);
				pushToken("op");
			} else if (char == ";") {
				push(char);
				pushToken("op");
			} else if (char == "'") {
				push(char);
				if (nextChar && (isNumber(nextChar) || isLetter(nextChar))) {
					state = 18;
				} else {
					bad();
				}
			} else if (char == "%") {
				push(char);
				pushToken("op");
			} else if (char == "$") {
				push(char);
				if (nextChar && is0_16(nextChar)) {
					state = 4;
				} else {
					bad();
				}
			} else if (char == "\n") {
        push(char);
				pushToken("op");
      } else if (isSpace(char) || isNewLine(char)) {
			} else {
				push(char);
				bad();
			}
		} else if (state == 1) {
			push(char);
			if (nextChar && isLetter(nextChar) || nextChar == "_" || isNumber(nextChar)) {
		
			} else {
				pushToken("id");
			}
		} else if (state == 2) {
			push(char);
			if (nextChar && is0_7(nextChar)) {
			} else {
				pushToken("int");
			}
		} else if (state == 3) {
			push(char);
			if (nextChar && is0_16(nextChar)) {
				state = 4;
			} else {
				bad();
			}
		} else if (state == 4) {
			push(char);
			if (nextChar && is0_16(nextChar)) {

			} else {
				pushToken("int");
				state = 0;
			}
		} else if (state == 5) {
			push(char);
			if (nextChar && nextChar == "\"") {
				state = 7;
			} else if (nextChar && isNotNewLine(nextChar)) {
				state = 6;
			} else {
				bad();
			}
		} else if (state == 6) {
			push(char);
			if (nextChar && nextChar == "\"") {
				state = 4;
			} else if (nextChar && nextChar == "\\") {
				state = 5
			} else if (nextChar && isNotNewLine(nextChar)) {
			} else {
				bad();
			}
		} else if (state == 7) {
			push(char);
			if (nextChar && nextChar == "\"") {
				state = 4;
			} else if (nextChar && isNotNewLine(nextChar)) {
				state = 6;
			} else {
				bad();
			}
		} else if (state == 8) {
			push(char);
			if (nextChar && isNumber(nextChar)) {
			} else if (nextChar && nextChar == ".") {
				state = 9;
			} else {
				pushToken("int");
			}
		} else if (state == 9) {
			push(char);
			if (nextChar && isNumber(nextChar)) {
				state = 10;
			} else {
				pushToken("real");
			}
		} else if (state == 10) {
			push(char);
			if (nextChar && isNumber(nextChar)) {
			} else {
				pushToken("real");
			}
		} else if (state == 11) {
			push(char);
			pushToken("op");
		} else if (state == 12) {
			push(char);
			pushToken("op");
		} else if (state == 13) {
			push(char);
			pushToken("op");
		} else if (state == 14) {
			push(char);
			pushToken("op");
		} else if (state == 15) {
			push(char);
			pushToken("op");
		} else if (state == 16) {
			push(char);
			pushToken("op");
		} else if (state == 17) {
			push(char);
			pushToken("op");
		} else if (state == 18) {
			push(char);
			if (nextChar && nextChar == "'") {
				state = 19;
			} else if (nextChar && (isNumber(nextChar) || isLetter(nextChar))) {
			} else {
				bad();
			}
		} else if (state == 19) {
			push(char);
			pushToken("mark");
		} else if (state == 20) {
      push(char);
      if (!nextChar || isNewLine(nextChar)) {
        pushToken("comment");
      }
    } else if (state == 21) {
      push(char);
      if (!nextChar) {
        bad();
      } else if (nextChar == "*") {
        state = 22;
      }
    } else if (state == 22) {
      push(char);
      if (!nextChar) {
        bad();
      } else if (nextChar == "*") {
      } else if (nextChar == "/") {
        state = 23;
      } else {
        state = 21;
      }
    } else if (state == 23) {
      push(char);
      pushToken("block_comment");
    }

		if (char == "\n") {
			lineNumber++;
			position = 0;
		} else {
			position++;
		}
	}
  // console.log(tokens);
	return tokens;
}

tokens(`

// aab
0xa
/*********/
//`);

export {Token, TokenType, tokens};
