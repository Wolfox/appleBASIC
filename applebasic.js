this.applebasic = (function() {

  Array.prototype.map = function(projectionFunction) {
    var results = [];
    this.forEach(
      function(item) {
        results.push(projectionFunction(item));
      }
    );
    return results;
  };

  basic = {};

  var codeOutput;

  var tokenType = {
    LineNumber: "LineNumber",
    Separator: "Separator",
    ReservedKeyword: "ReservedKeyword",
    Identifier: "Identifier",
    Strings: "Strings",
    Numbers: "Numbers",
    Operator: "Operator",
    WhiteSpace: "WhiteSpace",
    NewLine: "NewLine"
  };

  var variables = [];
  var functions = [];

  function getVariable(nam) {
    for(var i=0;i<variables.length; i++) {
      if(variables[i].map === nam) {
        return variables[i].val;
      }
    }
    return 0;
  }

  function setVariable(nam,va) {
    for(var i=0; i<variables.length; i++) {
      if(variables[i].map === nam) {
        variables[i].val = va;
        return true;
      }
    }
    var variable = {
      map:nam,
      val:va
    }
    variables.push(variable);
    return true;
  }

  function clearVariables() {
    variables = [];
  }

  function getFunction(nam) {
    for(var i=0;i<functions.length; i++) {
      if(functions[i].name === nam) {
        return functions[i];
      }
    }
    return undefined;
  }

  function setFunctions(nam, ident, expr) {
    for(var i=0; i<functions.length; i++) {
      if(functions[i].name === nam) {
        functions[i].identifier = ident;
        functions[i].expression = expr;
        return true;
      }
    }
    var fVariable = {
      name:nam,
      identifier: ident,
      expression: expr
    }
    functions.push(fVariable);
    return true;
  }

  function clearFunctions() {
    functions = [];
  }

  function createToken(value, type) {
    return {
      value:value,
      type: type
    };
  }

  function createLine(linNum, tokens) {
    return {
        lineNumber: linNum,
        tokens: tokens
      };
  }

  function matchValueToken(token, value) {
    return (token !== undefined && token.value === value);
  }

  function matchTypeToken(token, type) {
    return (token !== undefined && token.type === type);
  }

  function matchValueTokenNot(token, value) {
    return (token === undefined || token.value !== value);
  }

  function matchTypeTokenNot(token, type) {
    return (token === undefined || token.type !== type);
  }

  var reservedKeywords = ["CLEAR", "LET", "DIM", "DEF", "GOTO", "GOSUB", "RETURN",
                      "ONERR", "ON", "POP", "FOR", "TO", "STEP", "NEXT", "IF", "THEN", "END",
                      "STOP", "RESUME", "PRINT", "INPUT", "GET", "HOME", "HTAB", "VTAB",
                      "INVERSE", "FLASH", "NORMAL", "TEXT", "GR", "COLOR\\\=", "PLOT",
                      "HLIN", "VLIN", "HGR2", "HGR", "HPLOT", "HCOLOR\\\=", "DATA", "READ",
                      "RESTORE","REM", "TRACE", "NOTRACE", "ROT\\\=", "SCALE\\\=", "DRAW",
                      "XDRAW", "CONT", "DEL","LIST", "NEW", "RUN", "HIMEM\\\:", "IN\\\#",
                      "LOMEM\\\:", "WAIT", "LOAD", "RECALL", "SAVE", "STORE", "SHLOAD",
                      "SPEED\\\=", "POKE", "CALL", "PR\\\#", "ABS", "ASC", "ATN", "AT",
                      "COS", "EXP", "INT", "LOG", "RND", "SGN", "SIN", "SQR", "TAN", "PEEK",
                      "FN", "LEN", "LEFT\\\$", "MID\\\$", "RIGHT\\\$", "CHR\\\$", "STR\\\$", "VAL",
                      "FRE", "PDL", "POS", "SCRN", "HSCRN", "USR", "AND", "OR", "NOT", "\\\?"];

  // TYPE OF TOKENS:
  var regexLineNumber = /^[0-9]+/, // linenumber   - start of a new line
      regexSeparator = /^:/, // separator    - separates statements on the same line
      regexReservedKeyword = new RegExp("^(" + reservedKeywords.join("|") + ")", "i"), // reserved     - reserved keywords
      regexIdentifier = /^([A-Za-z][A-Za-z0-9]?)[A-Za-z0-9]*(\$|%)?/, // identifier   - variable name
      regexString = /^"([^"]*?)(?:"|(?=\n|\r|$))/, // string       - string
      regexNumber = /^[-+]?\d*\.?\d+([eE][-+]?\d+)?/, // number       - number
      regexOperator = /^[;=<>+\-*\/\^(),]/, // operator     - operator
      regexWhiteSpace = /^[ \t]+/,
      regexNewline = /^\r?\n//*,
      regexAnything = /^./*/;

  basic.tokenizer = function(source) {

    var tokens = [];
    tokens = createTokens(source, true, []);
    console.log(tokens);
    //basic.divideByLines(tokens);
  }

  function createTokens(source, isNewLine, returnVal) {
    var nxtToken = getNextToken(source, isNewLine);
    if(!nxtToken) {
      return returnVal;
    }
    source = nxtToken[1];
    returnVal.push(nxtToken[0]);
    return createTokens(source, nxtToken[0].type === tokenType.NewLine ,returnVal);
  }

  function getNextToken(source, isNewLine) {
    var read, token;

    source = ignoreWhiteSpaces(source);

    if(sourceHasEnded(source)) {
      return false;
    }

    read = readSource(source, regexNewline);
    if(read[0]) {
      source = read[1];
      token = createToken(read[0], tokenType.NewLine);
      return [token, source];
    }

    if(isNewLine) {
      read = readSource(source, regexLineNumber);
      if(read[0]) {
        source = read[1];
        token = createToken(Number(read[0]), tokenType.LineNumber);
        return [token, source];
      }
    }

    read = readSource(source, regexReservedKeyword);
    if(read[0]) {
      source = read[1];
      token = createToken(read[0].toUpperCase(), tokenType.ReservedKeyword);
      return [token, source];
    }

    read = readSource(source, regexIdentifier);
    if(read[0]) {
      source = read[1];
      token = createToken(read[0], tokenType.Identifier);
      return [token, source];
    }

    read = readSource(source, regexString);
    if(read[0]) {
      source = read[1];
      token = createToken(read[0], tokenType.Strings);
      return [token, source];
    }

    read = readSource(source, regexNumber);
    if(read[0]) {
      source = read[1];
      token = createToken(parseFloat(read[0]), tokenType.Numbers);
      return [token, source];
    }

    read = readSource(source, regexOperator);
    if(read[0]) {
      source = read[1];
      token = createToken(read[0], tokenType.Operator);
      return [token, source];
    }

    read = readSource(source, regexSeparator);
    if(read[0]) {
      source = read[1];
      token = createToken(read[0], tokenType.Separator);
      return [token, source];
    }

    console.log("ERROR");
    return false;
  }

  function ignoreWhiteSpaces(source) {
    var read = readSource(source, regexWhiteSpace);
    if(read[0]) {
      return ignoreWhiteSpaces(read[1]);
    }
    return source;
  }

  function readSource(source, regex) {
    var read = source.match(regex);

    if(read) {
      source = source.substr(read[0].length); // remove the identified token
      return [read[0], source];
    }

    return [undefined, source];
  }

  function sourceHasEnded(source) {
    return source.length === 0;
  }

  basic.divideByLines = function(tokens) {
    var lines = createLines(tokens,[],[]);

    lines.sort(function(a,b) {
      return a.lineNumber - b.lineNumber;
    });

    basic.ASTparser(lines);
  }

  function createLines(allTokens, toCreate, returnVal) {
    if(allTokens.length === 0) {
      if(toCreate.length > 0) {
        returnVal.push(createSingleLine(toCreate));
        toCreate = [];
      }
      return returnVal;
    }
    var head = allTokens.shift();
    if(head.type === tokenType.NewLine) {
      if(toCreate.length > 0) {
        returnVal.push(createSingleLine(toCreate));
        toCreate = [];
      }
    } else {
      toCreate.push(head);
    }
    return createLines(allTokens,toCreate,returnVal);
  }

  function createSingleLine(tokenList) {
    if(tokenList[0].type !== tokenType.LineNumber) {
      throw new SyntaxError("Expected line number");
    }
    return createLine(tokenList.shift().value, tokenList); //TODO: change head
  }

  basic.ASTparser = function(lines) {
    var tree = ast_parser.parse(lines);
    console.log(tree);
    //basic.run(tree);
  }

  basic.compile = function(source, codeOut) {
    codeOutput = codeOut;
    tokens = basic.tokenizer(source);
  }


  function addOutput(output) {
    if(codeOutput) {
      codeOutput.setValue(codeOutput.getValue()+output);
    } else {
      throw 'ResultBox not connected';
    }
  }

  function clearOutput() {
    if(codeOutput) {
      codeOutput.setValue("");
    } else {
      throw 'ResultBox not connected';
    }
  }

  return basic
}());