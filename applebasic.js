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

  basic.tokenizer = function(source) {
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
    var parsedSource = source,
        lastReadedValue, newline = true,
        tokens = [];

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

    function sourceHasEnded() {
      return parsedSource.length === 0;
    }

    function readSource(regex) {
      var read = parsedSource.match(regex);

      //console.log("read" + read);

      if(read) {
        parsedSource = parsedSource.substr(read[0].length); // remove the identified token
        lastReadedValue = read;
        return read;
      }

      return (void 0); // return undefined
    }

    var getNextToken = function() {

      while(readSource(regexWhiteSpace)); // {console.log("SPAAAAAACE!!!!");}

      if(sourceHasEnded()) {
        return false;
      }

      if(readSource(regexNewline)) {
        newline = true;
        return createToken(lastReadedValue[0], tokenType.NewLine);
      }

      if(newline) {
        if(readSource(regexLineNumber)) {
          newline = false;
          return createToken(Number(lastReadedValue[0]), tokenType.LineNumber);
        }
        newline = false;
      }

      if(readSource(regexReservedKeyword)) {
        return createToken(lastReadedValue[0].toUpperCase(), tokenType.ReservedKeyword);
      }

      if(readSource(regexIdentifier)) {
        return createToken(lastReadedValue[0], tokenType.Identifier);
      }

      if(readSource(regexString)) {
        return createToken(lastReadedValue[1], tokenType.Strings);
      }

      if(readSource(regexNumber)) {
        return createToken(parseFloat(lastReadedValue[0]), tokenType.Numbers);
      }

      if(readSource(regexOperator)) {
        return createToken(lastReadedValue[0], tokenType.Operator);
      }

      if(readSource(regexSeparator)) {
        return createToken(lastReadedValue[0], tokenType.Separator);
      }

      //throw new SyntaxError("Something is very wrong!");
      return token;
    }

    nxtToken = getNextToken();

    while(nxtToken) {
      tokens.push(nxtToken);
      nxtToken = getNextToken();
    }

    return tokens;
  }

  function sortingLines(lines) {
    for(i=0; i < lines.length; i++) {
      for(j=i; j < lines.length; j++) {
        if(lines[j].lineNumber < lines[i].lineNumber) {
          tempLine = lines[i];
          lines[i] = lines[j];
          lines[j] = tempLine;
        }
      }
    }
    return lines;
  }

  basic.divideByLines = function(tokens) {
    var lines = [],
        newline = true;

    for( i=0 ; i < tokens.length; i++) {
      if(tokens[i].type === tokenType.NewLine) continue;

      var line = createLine(0,[]);

      if(tokens[i].type === tokenType.LineNumber) {
        line.lineNumber = tokens[i].value;
        i++
        while(i < tokens.length && tokens[i].type != tokenType.NewLine) {
          line.tokens.push(tokens[i]);
          i++;
        }
        lines.push(line);
      } else {
        throw new SyntaxError("Expected line number");
      }
      
    }

    lines = sortingLines(lines);

    return lines;
  }

  basic.compile = function(source, codeOut) {

    //console.log(test.hello());

    //console.log([{type: "Number", value: 2}, {type: "Operator", value: '+'}, {type: "Number", value: 2}]);
    

    /*asdfg = Parsimmon.string(',').skip(Parsimmon.string('a'));

    console.log(asdfg.parse(",b"));*/

    var tokens, lines, tree;
    codeOutput = codeOut;
    //console.log("--------- SOURCE ----------");
    //console.log(source);
    //console.log("--------- TOKENIZER ------------");
    tokens = basic.tokenizer(source);
    //console.log(tokens);
    //ast_parser.parseExpr(tokens);
    //console.log("--------- PARSE LINES ------------");
    lines = basic.divideByLines(tokens);
    console.log(lines);
    tree = ast_parser.parse(lines)
    console.log(tree);
    /*//console.log("--------- RUN LINES ------------");
    //try {
      basic.run(tree);
    /*} catch(err) {
      alert(err);
    }*/

    return null;
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