"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var Global = /** @class */ (function () {
    function Global() {
    }
    Global.supportVjass = true;
    return Global;
}());
var Jass = /** @class */ (function () {
    function Jass() {
    }
    Jass.Types = ["agent", "event", "player", "widget", "unit", "destructable", "item", "ability", "buff", "force", "group", "trigger", "triggercondition", "triggeraction", "timer", "location", "region", "rect", "boolexpr", "sound", "conditionfunc", "filterfunc", "unitpool", "itempool", "race", "alliancetype", "racepreference", "gamestate", "igamestate", "fgamestate", "playerstate", "playerscore", "playergameresult", "unitstate", "aidifficulty", "eventid", "gameevent", "playerevent", "playerunitevent", "unitevent", "limitop", "widgetevent", "dialogevent", "unittype", "gamespeed", "gamedifficulty", "gametype", "mapflag", "mapvisibility", "mapsetting", "mapdensity", "mapcontrol", "playerslotstate", "volumegroup", "camerafield", "camerasetup", "playercolor", "placement", "startlocprio", "raritycontrol", "blendmode", "texmapflags", "effect", "effecttype", "weathereffect", "terraindeformation", "fogstate", "fogmodifier", "dialog", "button", "quest", "questitem", "defeatcondition", "timerdialog", "leaderboard", "multiboard", "multiboarditem", "trackable", "gamecache", "version", "itemtype", "texttag", "attacktype", "damagetype", "weapontype", "soundtype", "lightning", "pathingtype", "mousebuttontype", "animtype", "subanimtype", "image", "ubersplat", "hashtable", "framehandle", "originframetype", "framepointtype", "textaligntype", "frameeventtype", "oskeytype", "abilityintegerfield", "abilityrealfield", "abilitybooleanfield", "abilitystringfield", "abilityintegerlevelfield", "abilityreallevelfield", "abilitybooleanlevelfield", "abilitystringlevelfield", "abilityintegerlevelarrayfield", "abilityreallevelarrayfield", "abilitybooleanlevelarrayfield", "abilitystringlevelarrayfield", "unitintegerfield", "unitrealfield", "unitbooleanfield", "unitstringfield", "unitweaponintegerfield", "unitweaponrealfield", "unitweaponbooleanfield", "unitweaponstringfield", "itemintegerfield", "itemrealfield", "itembooleanfield", "itemstringfield", "movetype", "targetflag", "armortype", "heroattribute", "defensetype", "regentype", "unitcategory", "pathingflag"];
    Jass.Keywords = ["function", "endfunction", "constant", "native", "local", "type", "set", "call", "takes", "returns", "extends", "array", "true", "false", "null", "nothing", "if", "else", "elseif", "endif", "then", "loop", "endloop", "exitwhen", "return", "integer", "real", "boolean", "string", "handle", "code", "and", "or", "not", "globals", "endglobals"];
    Jass.VjassKeywords = ["library", "initializer", "needs", "requires", "endlibrary", "scope", "endscope", "private", "public", "static", "interface", "endinterface", "implement", "struct", "endstruct", "method", "endmethod", "this", "delegate", "operator", "debug"];
    return Jass;
}());
var JassStatus;
(function (JassStatus) {
    JassStatus[JassStatus["Start"] = 0] = "Start";
    JassStatus[JassStatus["Nill"] = 1] = "Nill";
    JassStatus[JassStatus["CommentStart"] = 2] = "CommentStart";
    JassStatus[JassStatus["LineComment"] = 3] = "LineComment";
    JassStatus[JassStatus["BlockComment"] = 4] = "BlockComment";
    JassStatus[JassStatus["WillBreakBlockComment"] = 5] = "WillBreakBlockComment";
    JassStatus[JassStatus["Letter"] = 6] = "Letter";
    JassStatus[JassStatus["C"] = 7] = "C";
})(JassStatus || (JassStatus = {}));
var JassAutoMaMachine = /** @class */ (function () {
    function JassAutoMaMachine(content) {
        this.slots = new Array();
        this.status = new Array();
        this.startLine = 0;
        this.startIndex = 0;
        this.index = -1;
        this.line = 0;
        this.commentStatus = JassStatus.Nill;
        this.jassStatus = JassStatus.Nill;
        this.content = content;
    }
    JassAutoMaMachine.prototype.doing = function () {
        for (var i = 0; i < this.content.length; i++) {
            this.put(this.content.charAt(i));
        }
    };
    JassAutoMaMachine.prototype.start = function () {
        this.doing();
    };
    JassAutoMaMachine.prototype.put = function (char) {
        if (this.commentStatus == JassStatus.Nill) {
            if (Tool.isLeftSlash(char)) {
                this.commentStatus = JassStatus.CommentStart;
            }
            else if (Tool.isLatter(char)) {
                this.commentStatus = JassStatus.Letter;
                console.log("切换到字母");
                this.startLine = this.line;
                this.startIndex = this.index;
                this.slots.push(char);
            }
        }
        else if (this.commentStatus == JassStatus.CommentStart) {
            if (Tool.isAsterisk(char)) {
                this.commentStatus = JassStatus.BlockComment;
                this.data = new BlockComment();
                this.startLine = this.line;
                this.startIndex = this.index - 1;
            }
            else if (Tool.isLeftSlash(char)) {
                this.commentStatus = JassStatus.LineComment;
                this.data = new LineComment();
                this.startLine = this.line;
                this.startIndex = this.index - 1;
            }
            else {
                this.commentStatus = JassStatus.Nill;
            }
        }
        else if (this.commentStatus == JassStatus.LineComment) {
            if (Tool.isNewLine(char)) {
                this.commentStatus = JassStatus.Nill;
                var lineComment = this.data;
                lineComment.startLine = this.startLine;
                lineComment.startIndex = this.startIndex;
                lineComment.endLine = this.line;
                lineComment.endIndex = this.index;
                lineComment.commentContent = this.get();
                this.clear();
                if (this.onLineComment) {
                    this.onLineComment(lineComment);
                }
            }
            else {
                this.slots.push(char);
            }
        }
        else if (this.commentStatus == JassStatus.BlockComment) {
            if (Tool.isAsterisk(char)) {
                this.commentStatus = JassStatus.WillBreakBlockComment;
            }
            else {
                this.slots.push(char);
            }
        }
        else if (this.commentStatus == JassStatus.WillBreakBlockComment) {
            if (Tool.isLeftSlash(char)) {
                this.commentStatus = JassStatus.Nill;
                var blockComment = this.data;
                blockComment.startLine = this.startLine;
                blockComment.startIndex = this.startIndex;
                blockComment.endLine = this.line;
                blockComment.endIndex = this.index;
                blockComment.commentContent = this.get();
                this.clear();
                if (this.onBlockComment) {
                    this.onBlockComment(blockComment);
                }
            }
            else {
                this.slots.push(Tool.Asterisk);
                this.slots.push(char);
                this.commentStatus = JassStatus.BlockComment;
            }
        }
        else if (this.commentStatus == JassStatus.Letter) {
            console.log("字母");
            if (Tool.isLatter(char) || Tool.isNumber(char) || Tool.isUnderline(char)) {
                this.slots.push(char);
            }
            else if (Tool.isLeftSlash(char)) {
                this.commentStatus = JassStatus.CommentStart;
                if (this.onError) {
                    var error = new JassError("", this.get());
                    error.startLine = this.startLine;
                    error.startIndex = this.startIndex;
                    error.endLine = this.line;
                    error.endIndex = this.index;
                    this.onError(error);
                    this.clear();
                }
            }
        }
        if (Tool.isNewLine(char)) {
            this.index = 0;
            this.line++;
        }
        else if (char.length > 0) {
            this.index++;
        }
    };
    JassAutoMaMachine.prototype.clear = function () {
        this.slots = [];
    };
    JassAutoMaMachine.prototype.get = function () {
        return this.slots.join("");
    };
    return JassAutoMaMachine;
}());
var Tool = /** @class */ (function () {
    function Tool() {
    }
    Tool.isNewLine = function (char) {
        return char == this.NewLine;
    };
    // 是否/
    Tool.isLeftSlash = function (char) {
        return char == this.LeftSlash;
    };
    Tool.isLatter = function (char) {
        return __spreadArrays(this.LowercaseLetters, this.Capital).includes(char);
    };
    // 是否*
    Tool.isAsterisk = function (char) {
        return char == this.Asterisk;
    };
    // 是否数字
    Tool.isNumber = function (char) {
        return this.Numbers.includes(char);
    };
    // 是否下划线
    Tool.isUnderline = function (char) {
        return char == this.Underline;
    };
    Tool.LowercaseLetters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",];
    Tool.Capital = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",];
    Tool.Numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    Tool.Underline = "_";
    Tool.Comma = ",";
    Tool.LeftParenthesis = "(";
    Tool.RightParenthesis = ")";
    Tool.LeftSlash = "/";
    Tool.Asterisk = "*";
    Tool.GreaterThan = ">";
    Tool.LessThan = "<";
    Tool.NewLine = "\n";
    return Tool;
}());
var LineComment = /** @class */ (function () {
    function LineComment(commentContent) {
        this.endLine = 0;
        this.endIndex = 0;
        this.startLine = 0;
        this.startIndex = 0;
        this.commentContent = "";
        if (commentContent) {
            this.commentContent = commentContent;
        }
    }
    return LineComment;
}());
var BlockComment = /** @class */ (function () {
    function BlockComment(commentContent) {
        this.endLine = 0;
        this.endIndex = 0;
        this.startLine = 0;
        this.startIndex = 0;
        this.commentContent = "";
        if (commentContent) {
            this.commentContent = commentContent;
        }
    }
    return BlockComment;
}());
var JassError = /** @class */ (function () {
    function JassError(errorMessage, errorContent) {
        this.endLine = 0;
        this.endIndex = 0;
        this.startLine = 0;
        this.startIndex = 0;
        this.errorContent = "";
        this.errorMessage = "";
        if (errorMessage) {
            this.errorMessage = errorMessage;
        }
        if (errorContent) {
            this.errorContent = errorContent;
        }
    }
    return JassError;
}());
var m = new JassAutoMaMachine("\na22_/\n// /*123*/\n/* // aa */\n\n/*a/*aa*/\n\n");
m.onLineComment = function (comment) {
    console.log(comment);
};
m.onBlockComment = function (comment) {
    console.log(comment);
};
m.onError = function (a) {
    console.log(a);
};
m.start();
