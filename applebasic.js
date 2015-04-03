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

  var STATEMENT = 'applebasic-statement',
      OPERATOR = 'applebasic-operator',
      FUNCTION = 'applebasic-function',
      UNSUPPORTED = 'applebasic-unsupported';

  var typeReservedKeywords = {
    "AT": STATEMENT, // HLIN aexpr, aexpr AT aexpr
    "CLEAR": STATEMENT, // Clear all variables
    "LET": STATEMENT, // Assign variable
    "DIM": STATEMENT, // Allocate array(s) with given dimension(s)
    "DEF": STATEMENT, // Define function of a single variable [1]
    "GOTO": STATEMENT, // Jump to line number
    "GOSUB": STATEMENT, // Enter subroutine at line number
    "RETURN": STATEMENT, // Return from subroutine
    "ON": STATEMENT, // Branch based on index (value = 1, 2, ...)
    "POP": STATEMENT, // Convert last GOSUB into a GOTO
    "FOR": STATEMENT, // Loop
    "TO": STATEMENT, // FOR var = aexpr TO aexpr [ STEP aexpr ]
    "STEP": STATEMENT, // FOR var = aexpr TO aexpr [ STEP aexpr ]
    "NEXT": STATEMENT, // End of loop(s)
    "IF": STATEMENT, // If expr is false, rest of line is skipped
    "THEN": STATEMENT, // Conditional
    "END": STATEMENT, // Terminate program cleanly
    "STOP": STATEMENT, // Break, as if an error occurred
    "ONERR": STATEMENT, // ONERR GOTO Set error hook
    "RESUME": STATEMENT, // Retry line that caused ONERR GOTO
    "PRINT": STATEMENT, // Output text. ; concatenates, , advances to next tab stop. A trailing ; suppresses line break.
    "INPUT": STATEMENT, // Read line of comma-delimited input, with optional prompt
    "GET": STATEMENT, // Read single key
    "HOME": STATEMENT, // Clear text display
    "HTAB": STATEMENT, // Position text cursor horizontally (1...40 or 1...80)
    "VTAB": STATEMENT, // Position text cursor vertically (1...24)
    "INVERSE": STATEMENT, // Set output mode to black-on-white
    "FLASH": STATEMENT, // Set output mode to flashing
    "NORMAL": STATEMENT, // Set output mode to white-on-black
    "TEXT": STATEMENT, // Set display to text mode
    "GR": STATEMENT, // Set display to mixed test/low resolution ("lores") graphics mode, clear screen to black
    "COLOR=": STATEMENT, // Set lores color (0...15)
    "PLOT": STATEMENT, // Plot lores point (x = 0...39, y = 0...39/47)
    "HLIN": STATEMENT, // Plot horizontal line (x1, x2 at y)
    "VLIN": STATEMENT, // Plot vertical line (y1, y2 at x)
    "HGR": STATEMENT, // Set display to mixed/high resolution ("hires") graphics mode, clear screen to black
    "HGR2": STATEMENT, // Set display to full hires mode (page 2), clear screen to black
    "HPLOT": STATEMENT, // Plot hires point/line (x=0...279, y=0...191)
    "HCOLOR=": STATEMENT, // Set hires color (0...7)
    "DATA": STATEMENT, // Define inline data. Values can be literals (unquoted strings), strings, or numbers
    "READ": STATEMENT, // Read the next DATA value
    "RESTORE": STATEMENT, // Restore the DATA pointer to the first value
    "REM": STATEMENT, // Begin a comment; rest of line is skipped
    "TRACE": STATEMENT, // Turn on trace mode (line numbers printed)
    "NOTRACE": STATEMENT, // Turn off trace mode
    "ROT=": UNSUPPORTED, // STATEMENT - Set hires shape table rotation (0...63)
    "SCALE=": UNSUPPORTED, // STATEMENT - Set hires shape table scale (1...255)
    "DRAW": UNSUPPORTED, // STATEMENT - Draw hires shape table shape in color
    "XDRAW": UNSUPPORTED, // STATEMENT - Draw hires shape table shape with XOR
    "CONT": UNSUPPORTED, // STATEMENT - Continue from a STOP - NOT IMPLEMENTED
    "DEL": UNSUPPORTED, // STATEMENT - Delete lines of program - NOT IMPLEMENTED
    "LIST": UNSUPPORTED, // STATEMENT - List lines of program - NOT IMPLEMENTED
    "NEW": UNSUPPORTED, // STATEMENT - Clear program and variables - NOT IMPLEMENTED
    "RUN": UNSUPPORTED, // STATEMENT - Start program execution at line - NOT IMPLEMENTED
    "HIMEM:": UNSUPPORTED, // STATEMENT - Set upper address of variable memory - NOT IMPLEMENTED
    "IN#": UNSUPPORTED, // STATEMENT - Direct input from slot - NOT IMPLEMENTED
    "LOMEM:": UNSUPPORTED, // STATEMENT - Set lower address of variable memory - NOT IMPLEMENTED
    "WAIT": UNSUPPORTED, // STATEMENT - Wait until memory location masked by second argument equals third argument (or zero) - NOT IMPLEMENTED
    "LOAD": UNSUPPORTED, // STATEMENT - Load program from cassette - NOT IMPLEMENTED
    "RECALL": UNSUPPORTED, // STATEMENT - Load variables from cassette - NOT IMPLEMENTED
    "SAVE": UNSUPPORTED, // STATEMENT - Save program to cassette - NOT IMPLEMENTED
    "STORE": UNSUPPORTED, // STATEMENT - Save variables to cassette - NOT IMPLEMENTED
    "SHLOAD": UNSUPPORTED, // STATEMENT - Load hires shape table from cassette - NOT IMPLEMENTED
    "SPEED=": STATEMENT, // Set character output delay - has no effect
    "POKE": STATEMENT, // Set memory location to value
    "CALL": STATEMENT, // Call native routine
    "PR#": STATEMENT, // Direct output to slot
    "ABS": FUNCTION, // Absolute value of number
    "ASC": FUNCTION, // ASCII code for first character of string
    "ATN": FUNCTION, // Arctangent of number
    "COS": FUNCTION, // Cosine of number
    "EXP": FUNCTION, // Raise e to number
    "INT": FUNCTION, // Integer part of number
    "LOG": FUNCTION, // Natural log of number
    "RND": FUNCTION, // Pseudo-random number generator (0 repeats last, negative reseeds)
    "SGN": FUNCTION, // Sign of number (-1,0,1)
    "SIN": FUNCTION, // Sine of number
    "SQR": FUNCTION, // Square root of number
    "TAN": FUNCTION, // Tangent of number
    "PEEK": FUNCTION, // Value at memory location
    "FN": FUNCTION, // Execute user defined function [1]
    "LEN": FUNCTION, // Length of string
    "LEFT$": FUNCTION, // Left portion of (string, length)
    "MID$": FUNCTION, // Substring of (string, start character, length)
    "RIGHT$": FUNCTION, // Right portion of (string, length)
    "CHR$": FUNCTION, // Character at specified ASCII code point [3]
    "STR$": FUNCTION, // String representation of number
    "VAL": FUNCTION, // Parse string into number
    "FRE": FUNCTION, // Garbage collect strings (returns 0)
    "PDL": FUNCTION, // Paddle position (paddle number)
    "POS": FUNCTION, // Horizontal cursor position
    "SCRN": FUNCTION, // Lores color at pixel (x,y)
    "HSCRN": FUNCTION, // Hires color at pixel (x,y) [4]
    "USR": UNSUPPORTED, // FUNCTION - Execute assembly code at address, return accumulator value - NOT IMPLEMENTED
    "AND": OPERATOR, // Conjunction
    "OR": OPERATOR, // Disjunction
    "NOT": OPERATOR, // Negation
    "?": STATEMENT 
  };

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
  }

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

  basic.ASTparser = function(lines) {
    var tokenIndex, parseLinNum;
    var ASTree = [];

    function parseLine(line) {
      var statem;

      parseLinNum = line.lineNumber;
      tokenIndex = 0;
      statem = parseStatements(line.tokens);

      return {
        lineNumber: line.lineNumber,
        statement: statem
      };
    }

    function parseStatements(tokens) {
      return parseMultStatments(tokens);
    }

    function parseSingleStatment(tokens) {
      var token, expr;
      token = peekToken(tokens);

      if(!token) {
        return undefined;
      }

      if(matchTypeToken(token, tokenType.Identifier)) {
        return parseAssigment(tokens);
      }

      if(matchTypeToken(token, tokenType.ReservedKeyword)) {
        switch(token.value) {
          case 'LET': // Assign variable
            nextToken(tokens);
            return parseAssigment(tokens);
          case 'CLEAR': // Clear all variables
          case 'RETURN': // Return from subroutine
          case 'END': // Terminate program cleanly          
          case 'STOP': // Break, as if an error occurred
          case 'POP': // Convert last GOSUB into a GOTO
          case 'RESUME': // Retry line that caused ONERR GOTO
          case 'HOME': // Clear text display
          case 'INVERSE': // Set output mode to black-on-white
          case 'FLASH': // Set output mode to flashing
          case 'NORMAL': // Set output mode to white-on-black
          case 'TEXT': // Set display to text mode
          case 'GR': // Set display to mixed test/low resolution ("lores") graphics mode, clear screen to black
          case 'HGR': // Set display to mixed/high resolution ("hires") graphics mode, clear screen to black
          case 'HGR2': // Set display to full hires mode (page 2), clear screen to black
          case 'RESTORE': // Restore the DATA pointer to the first value
          case 'TRACE': // Turn on trace mode (line numbers printed)
          case 'NOTRACE': // Turn off trace mode
          case 'CONT': // Continue from a STOP
          case 'DEL': // Delete lines of program
          case 'LOAD': // Load program from cassette
          case 'RECALL': // Load variables from cassette
          case 'SAVE': // Save program to cassette
          case 'STORE': // Save variables to cassette
          case 'SHLOAD': // Load hires shape table from cassette
          case 'NEW': // Clear program and variables
            token = nextToken(tokens);
            return {
              type: token.value
            };
          case 'DIM': // Allocate array(s) with given dimension(s)
            return parseDim(tokens);
          case 'DEF': // Define function of a single variable [1]
            return parseDef(tokens);
          case 'GOTO': // Jump to line number
          case 'GOSUB': // Enter subroutine at line number
          case 'HTAB': // Position text cursor horizontally (1...40 or 1...80)
          case 'VTAB': // Position text cursor vertically (1...24)
          case 'COLOR=': // Set lores color (0...15)
          case 'HCOLOR=': // Set hires color (0...7)
          case 'ROT=': // Set hires shape table rotation (0...63)
          case 'SCALE=': // Set hires shape table scale (1...255)
          case 'HIMEM:': // Set upper address of variable memory
          case 'IN#': // Direct input from slot
          case 'LOMEM:': // Set lower address of variable memory
          case 'SPEED=': // Set character output delay - has no effect
          case 'CALL': // Call native routine
          case 'PR#': // Direct output to slot
            token = nextToken(tokens);
            expr = parseValue(tokens);
            return {
              type: token.value,
              expression: expr
            };
          case 'ON': // Branch based on index (value = 1, 2, ...) OR Subroutine branch based on index (value = 1, 2, ...)
            return parseOn(tokens);
          case 'ONERR': // Set error hook
            return parseOnError(tokens);
          case 'PRINT': // Output text. ; concatenates, , advances to next tab stop. A trailing ; suppresses line break.
          case '?': // Shorthand for PRINT
            return parsePrint(tokens);
          case 'INPUT': // Read line of comma-delimited input, with optional prompt
            return parseInput(tokens);
          case 'GET': // Read single key
            return parseGet(tokens);
          case 'PLOT': // Plot lores point (x = 0...39, y = 0...39/47)
            return parsePlot(tokens);
          case 'HLIN': // Plot horizontal line (x1, x2 at y)
          case 'VLIN': // Plot vertical line (y1, y2 at x)
            return parseVHLin(tokens);
          case 'HPLOT': // Plot hires point/line (x=0...279, y=0...191)
            return parseHPlot(tokens);
          case 'DATA': // Define inline data. Values can be literals (unquoted strings), strings, or numbers
            return parseData(tokens);
          case 'READ': // Read the next DATA value
            return parseRead(tokens);
          case 'REM': // Begin a comment; rest of line is skipped
            while(nextToken(tokens));
            return {
              type: 'Comment'
            };
          case 'DRAW': // Draw hires shape table shape in color
          case 'XDRAW': // Draw hires shape table shape with XOR
            return parseDraw(tokens); 
          case 'LIST': // List lines of program
            return parseList(tokens);
          case 'RUN': // Start program execution at line
            return parseRun(tokens);
          case 'WAIT': // Wait until memory location masked by second argument equals third argument (or zero)
            return parseWait(tokens);
          case 'POKE': // Set memory location to value
            return parsePoke(tokens); 
          case 'IF': // Conditional; if expr is false, rest of line is skipped
            return parseIf(tokens);
          case 'FOR': // Loop with counter variable
            return parseFor(tokens);
          case 'NEXT': // End of loop(s)
            return parseNext(tokens);
          default:
            throw new SyntaxError(token.value + ' not expected in line ' + parseLinNum);
          /*
          "AT": STATEMENT, // HLIN aexpr, aexpr AT aexpr
          "TO": STATEMENT, // FOR var = aexpr TO aexpr [ STEP aexpr ]
          "STEP": STATEMENT, // FOR var = aexpr TO aexpr [ STEP aexpr ]
          "THEN": STATEMENT, // Conditional
          */
        }
      }

      return undefined;
    }

    function parseList(tokens) { // LIST [ linenum [, linenum ] ]
      var token, expr1, expr2;
      nextToken(tokens);
      token = peekToken(tokens);
      if(!matchValueToken, ':') {
        expr1 = parseValue(tokens);
        token = peekToken(tokens);
        if(matchValueToken(token, ',')) {
          nextToken(tokens);
          expr2 = parseValue(tokens);
        }
      }
      return {
        type: 'List',
        expression1: expr1,
        expression2: expr2
      };
    }

    function parseRun(tokens) { // RUN [ linenum ]
      var token, expr;
      nextToken(tokens);
      token = peekToken(tokens);
      if(!matchValueToken, ':') {
        expr = parseValue(tokens);
      }
      return {
        type: 'Run',
        expression: expr
      };
    }

    function parseWait(tokens) { // WAIT aexpr, aexpr [, aexpr]
      var token, expr1, expr2, expr3;
      nextToken(tokens);
      expr1 = parseValue(tokens);
      token = nextToken(tokens);
      if(matchValueTokenNot(token,',')) {
        throw new SyntaxError('Expecting , in line ' + parseLinNum);
      }
      expr2 = parseValue(tokens);
      token = peekToken(tokens);
      if(matchValueToken(token, ',')) {
        expr3 = parseValue(tokens);
      }
      return {
        type: 'Wait',
        expression1: expr1,
        expression2: expr2,
        expression3: expr3
      };
    }

    function parsePoke(tokens) { // POKE aexpr, aexpr
      var token, expr1, expr2;
      nextToken(tokens);
      expr1 = parseValue(tokens);
      token = nextToken(tokens);
      if(matchValueTokenNot(token,',')) {
        throw new SyntaxError('Expecting , in line ' + parseLinNum);
      }
      expr2 = parseValue(tokens);
      return {
        type: 'Poke',
        expression1: expr1,
        expression2: expr2
      };
    }

    function parseDraw(tokens) { // DRAW aexpr [ AT aexpr, aexpr ] ----- XDRAW aexpr [ AT aexpr, aexpr ]
      var token, isX, expr1, expr2, expr3;
      isX = nextToken(tokens);
      expr = parseValue(tokens);
      token = peekToken(tokens);
      if(matchValueToken(token,'AT')) {
        expr2 = parseValue(tokens);
        token = nextToken(tokens);
        if(matchValueTokenNot(token,',')) {
          throw new SyntaxError('Expecting , in line ' + parseLinNum);
        }
        expr3 = parseValue(tokens);
      }
      if(isx === 'XDRAW') {
        return {
          type:  'XDRaw',
          expression1: expr1,
          expression2: expr2,
          expression3: expr3
        };
      }
      return {
        type: 'Draw',
        expression1: expr1,
        expression2: expr2,
        expression3: expr3
      };
    }

    function parseRead(tokens) { // READ var [, var ...]
      var token;
      var param = [];
      nextToken(tokens);
      param.push(parseIdentifier(tokens));
      token = peekToken(tokens);
      while(matchValueToken(token,',')) {
        nextToken(tokens);
        param.push(parseIdentifier(tokens));
        token = peekToken(tokens);
      }
      return {
        type: "Read",
        parameters: param
      }
    }

    function parseData(tokens) { // DATA value [, value ...]
      var token;
      var param = [];
      nextToken(tokens);
      param.push(parseValue(tokens));
      token = peekToken(tokens);
      while(matchValueToken(token,',')) {
        nextToken(tokens);
        param.push(parseValue(tokens));
        token = peekToken(tokens);
      }
      return {
        type: 'Data',
        parameters: param
      };
    }

    function parseHPlot(tokens) { // HPLOT [TO] aexpr, aexpr [ TO aexpr, aexpr ] ...
      var token, expr1, expr2, expr3, expr4;
      nextToken(tokens);
      token = peekToken(tokens);
      if(matchValueToken(token,'TO')){
        nextToken(tokens);
      }
      expr = parseValue(tokens);
      token = nextToken(tokens);
      if(matchValueTokenNot(token,',')) {
        throw new SyntaxError('Expecting , in line ' + parseLinNum);
      }
      expr2 = parseValue(tokens);
      token = peekToken(tokens);
      if(matchValueToken(token,'TO')){
        nextToken(tokens);
        expr3 = parseValue(tokens);
        token = nextToken(tokens);
        if(matchValueTokenNot(token,',')) {
          throw new SyntaxError('Expecting , in line ' + parseLinNum);
        }
        expr4 = parseValue(tokens);
      }
      return {
        type: 'HPlot',
        expression1 : expr1,
        expression2 : expr2,
        expression3 : expr3,
        expression4 : expr4
      };
    }

    function parseVHLin(tokens) { // HLIN aexpr, aexpr AT aexpr ------ VLIN aexpr, aexpr AT aexpr
      var token, linType, expr, expr2, expr3;
      linType = nextToken(tokens);
      expr = parseValue(tokens);
      token = nextToken(tokens);
      if(matchValueToken(token, ',')) {
        throw new SyntaxError('Expecting , in line ' + parseLinNum);
      }
      expr2 = parseValue(tokens);
      token = nextToken(tokens);
      if(matchValueToken(token, 'AT')) {
        throw new SyntaxError('Expecting AT in line ' + parseLinNum);
      }
      expr3 = parseValue(tokens);
      return {
        type: 'VHLin',
        linType: linType,
        expression1: expr,
        expression2: expr2,
        expression3: expr3
      };
    }

    function parsePlot(tokens) { // PLOT aexpr, aexpr
      var token, expr, expr2;
      nextToken(tokens);
      expr = parseValue(tokens);
      token = nextToken(tokens);
      if(!matchValueToken(token, ',')) {
        throw new SyntaxError('Expecting , in line ' + parseLinNum);
      }
      expr2 = parseValue(tokens);
      return {
        type: 'Plot',
        expression1: expr,
        expression2: expr2
      };
    }

    function parseInput(tokens) { // INPUT [string ;] var [, var ...]
      var token, output, param;
      param = [];
      nextToken(tokens);
      token = peekToken(tokens);
      if(matchTypeToken(token,tokenType.Strings)) {
        nextToken(tokens);
        output = {
          type: 'String',
          value: token.value
        }
        token = nextToken(tokens);
        if(!matchValueToken(token, ';')) {
          throw new SyntaxError('Expecting ; in line ' + parseLinNum);
        }
      } else {
        output = {
          type: 'String',
          value: ""
        }
      }

      param.push(parseIdentifier(tokens));
      token = peekToken(tokens);

      while(matchValueToken(token, ',')) {
        nextToken(tokens);
        param.push(parseIdentifier(tokens));
        token = peekToken(tokens);
      }

      return {
        type: 'Input',
        question: output,
        parameters:param
      }
    }

    function parseGet(tokens) { // GET var
      var token, expr;
      nextToken(tokens);
      expr = parseIdentifier(tokens)
      return {
        type: 'Get',
        value: expr
      }
    }

    function parsePrint(tokens) { // PRINT expr [ [;,] expr ... ] [;]
      var token;
      var param = [];
      nextToken(tokens);
      token = peekToken(tokens);
      while(token && matchValueTokenNot(token,':')) {
        param.push(parseValue(tokens));
        token = peekToken(tokens);
      }
      return {
        type: 'Print',
        parameters: param
      };
    }

    function parseOnError(tokens) { // ONERR GOTO linenum
      var token, expr;
      nextToken(tokens);
      token = nextToken(tokens);
      if(matchValueTokenNot(token, 'GOTO')) {
        throw new SyntaxError('Expecting GOTO in line ' + parseLinNum);
      }
      expr = parseValue(tokens);
      return {
        type: 'OnErr',
        expression: expr
      };
    }

    function parseOn(tokens) { // ON aexpr GOTO linenum [, linenum ...] ----- ON aexpr GOSUB linenum [, linenum ...]
      var token, expr, secOp;
      var param = [];
      nextToken(tokens);
      expr = parseValue(tokens);
      token = nextToken(tokens);
      if(matchValueTokenNot(token, 'GOTO') && matchValueTokenNot(token, 'GOSUB')) {
        throw new SyntaxError('Expecting GOTO or GOSUB in line ' + parseLinNum);
      }
      secOp = token;
      param.push(parseValue(tokens));
      token = peekToken(tokens);
      while(matchValueToken(token, ',')) {
        nextToken(tokens);
        param.push(parseValue(tokens));
        token = peekToken(tokens);
      }
      return {
        type: 'On',
        value: expr,
        secondOperator: secOp,
        parameters: param
      };
    }

    function parseIf(tokens) { // IF expr THEN statement ----- IF expr GOTO linenum
      var token, expr;
      nextToken(tokens);
      expr = parseValue(tokens);
      token = nextToken(tokens);
      switch(token.value) {
        case 'THEN':
          var stat;
          stat = parseStatements(tokens);
          return {
            type: 'IfThen',
            expression: expr,
            statement: stat
          }
        case 'GOTO':
          var linNum;
          linNum = parseValue(tokens);
          return {
            type: 'IfGoTo',
            expression: expr,
            lineNumber: linNum
          }
        default:
          throw new SyntaxError('Expecting THEN or GOTO in line ' + parseLinNum);
      }
    }

    function parseFor(tokens) { // FOR var = aexpr TO aexpr [ STEP aexpr ]
      var token, identf, value1, value2, step;
      nextToken(tokens);
      identf = parseIdentifier(tokens);
      token = nextToken(tokens);
      if(matchValueTokenNot(token, '=')) {
        throw new SyntaxError('Expecting = in line ' + parseLinNum);
      }
      value1 = parseValue(tokens);
      token = nextToken(tokens);
      if(matchValueTokenNot(token, 'TO')) {
        throw new SyntaxError('Expecting TO in line ' + parseLinNum);
      }
      value2 = parseValue(tokens);
      token = peekToken(tokens);
      if(matchValueToken(token, 'STEP')) {
        nextToken(tokens);
        step = parseValue(tokens);
      } else {
        step = {
          type: 'Number',
          value: 1
        }
      }
      return {
        type: 'For',
        initVariable: identf,
        initValue: value1,
        endValue: value2,
        step: step
      }
    }

    function parseNext(tokens) { // NEXT [var [, var ...] ]
      var token;
      var param = [];
      nextToken(tokens);
      token = peekToken(tokens);
      if(matchTypeToken(token, tokenType.Identifier)) {
        param.push(parseIdentifier(tokens));
        token = peekToken(tokens);
        while(matchValueToken(token,',')) {
          nextToken(tokens);
          param.push(parseIdentifier(tokens));
          token = peekToken(tokens);
        }
      }
      return {
        type: 'Next',
        parameters: param
      }
    }

    function parseDim(tokens) { //DIM var( size [, size ...] ) [, var( size [, size ...] ) ...]
      var token;
      var paramVar = [];
      do {
        nextToken(tokens);
        var identf;
        var varSize = [];
        identf = parseIdentifier(tokens);
        token = nextToken(tokens);
        if(matchValueTokenNot(token,'(')) {
          throw new SyntaxError('Expecting ( in line ' + parseLinNum);
        }
        varSize.push(parseValue(tokens));
        token = peekToken(tokens);
        while (matchValueToken(token, ',')) {
          nextToken(tokens);
          varSize.push(parseValue(tokens));
          token = peekToken(tokens);
        }
        if(matchValueTokenNot(token,')')) {
          throw new SyntaxError('Expecting ) in line ' + parseLinNum);
        }
        paramVar.push({
          identifier:identf,
          size: varSize
        });
        token = peekToken(tokens);
      } while (matchValueToken(token, ','));
      return {
        type: 'Dim',
        parameters: paramVar
      }
    }

    function parseDef(tokens) { // DEF FN name(var) = aexpr
      var token, name, identf, expr;
      nextToken(tokens);
      token = nextToken(tokens);
      if(matchValueTokenNot(token,'FN')) {
        throw new SyntaxError('Expecting FN in line ' + parseLinNum);
      }
      name = parseIdentifier(tokens)
      token = nextToken(tokens);
      if(matchValueTokenNot(token,'(')) {
        throw new SyntaxError('Expecting ( in line ' + parseLinNum);
      }
      identf = parseIdentifier(tokens)
      token = nextToken(tokens);
      if(matchValueTokenNot(token,')')) {
        throw new SyntaxError('Expecting ) in line ' + parseLinNum);
      }
      token = nextToken(tokens);
      if(matchValueTokenNot(token,'=')) {
        throw new SyntaxError('Expecting = in line ' + parseLinNum);
      }
      expr = parseValue(tokens);
      return {
        type: 'DefFn',
        name: name,
        identifier: identf,
        expression: expr
      }
    }

    function parseIdentifier(tokens) {
      var token;
      token = nextToken(tokens);
      if(matchTypeTokenNot(token, tokenType.Identifier)) {
        throw new SyntaxError('Expecting Identifier in line ' + parseLinNum);
      }
      return token;
    }

    function parseAssigment(tokens) {
      var identf, token, expr;
      identf = parseIdentifier(tokens)
      token = nextToken(tokens);
      if(matchValueTokenNot(token, '=')) {
        throw new SyntaxError('Expecting = in line ' + parseLinNum);
      }
      expr = parseValue(tokens);
      return {
        type: 'Assigment',
        identifier: identf,
        value: expr
      }
    }

    function parseMultStatments(tokens) {
      var token, statem;
      statem = parseSingleStatment(tokens);
      token = peekToken(tokens);

      if (matchTypeToken(token,tokenType.Separator) && matchValueToken(token,':')) {
        token = nextToken(tokens);
        statem = {
          type: 'Separator',
          left: statem,
          right: parseMultStatments(tokens)
        }
        return statem;
      }

      return statem;
    }

    function parseValue(tokens) {
      return parseLogicOp(tokens);
    }

    function parseLogicOp(tokens) {
      var token,expr;
      expr = parseComp(tokens);
      token = peekToken(tokens);

      if (matchValueToken(token,'AND') || matchValueToken(token,'OR')) {
        token = nextToken(tokens);
        expr = {
          type: 'Logic',
          operator: token.value,
          left: expr,
          right: parseLogicOp(tokens)
        }
        return expr;
      }

      return expr;
    }

    function parseComp(tokens) {
      var token,expr, oper;
      expr = parseSumSub(tokens);
      token = peekToken(tokens);

      if (matchValueToken(token,'>') || matchValueToken(token,'<') || matchValueToken(token,'=')) {
        token = nextToken(tokens); 
        oper = token.value;
        token = peekToken(tokens);
        if(matchValueToken(token,'>') || matchValueToken(token,'<') || matchValueToken(token,'=')) {
          token = nextToken(tokens);
          oper += token.value;
        }
        expr = {
          type: 'Comparison',
          operator: oper,
          left: expr,
          right: parseComp(tokens)
        }
        return expr;
      }

      return expr;
    }

    function parseSumSub(tokens) {
      var token,expr;
      expr = parseMultDiv(tokens);
      token = peekToken(tokens);

      if (matchValueToken(token,'+') || matchValueToken(token,'-')) {
        token = nextToken(tokens);
        expr = {
          type: 'SumSub',
          operator: token.value,
          left: expr,
          right: parseSumSub(tokens)
        }
        return expr;
      }

      return expr;
    }

    function parseMultDiv(tokens) {
      var token,expr;
      expr = parsePower(tokens);
      token = peekToken(tokens);

      if (matchValueToken(token,'*') || matchValueToken(token,'/')) {
        token = nextToken(tokens);
        expr = {
          type: 'MultDiv',
          operator: token.value,
          left: expr,
          right: parseMultDiv(tokens)
        }
        return expr;
      }

      return expr;
    }

    function parsePower(tokens) {
      var token,expr;
      expr = parseUnit(tokens);
      token = peekToken(tokens);

      if (matchValueToken(token,'^')) {
        token = nextToken(tokens);
        expr = {
          type: 'PowerTo',
          operator: token.value,
          left: expr,
          right: parsePower(tokens)
        }
        return expr;
      }

      return expr;
    }

    function parseUnit(tokens) {
      var token, expr;
      token = peekToken(tokens);

      if (matchTypeToken(token,tokenType.Numbers)) {
        token = nextToken(tokens);
        return {
          type: 'Number',
          value: token.value
        };
      }

      if (matchTypeToken(token,tokenType.Strings)) {
        token = nextToken(tokens);
        return {
          type: 'String',
          value: token.value
        };
      }

      if (matchTypeToken(token,tokenType.Identifier)) {
        token = nextToken(tokens);
        return {
          type: 'Identifier',
          value: token.value
        };
      }

      if (matchValueToken(token,'NOT')) {
        nextToken(tokens);
        return {
          type: 'Not',
          value: parseUnit(tokens)
        };
      }

      if (matchValueToken(token,'(')) {
        nextToken(tokens);
        expr = parseValue(tokens);
        token = nextToken(tokens);
        if (!matchValueToken(token,')')) {
          throw new SyntaxError('Expecting ) in line ' + parseLinNum);
        }
        return expr;
      }

      if (matchTypeToken(token,tokenType.ReservedKeyword)) {
        var oper;
        var param = [];
        switch(token.value) {
          case "ABS": // Absolute value of number
          case "ASC": // ASCII code for first character of string
          case "ATN": // Arctangent of number
          case "COS": // Cosine of number
          case "EXP": // Raise e to number
          case "INT": // Integer part of number
          case "LOG": // Natural log of number
          case "RND": // Pseudo-random number generator (0 repeats last, negative reseeds)
          case "SGN": // Sign of number (-1,0,1)
          case "SIN": // Sine of number
          case "SQR": // Square root of number
          case "TAN": // Tangent of number
          case "PEEK": // Value at memory location
          case "LEN": // Length of string
          case "CHR$": // Character at specified ASCII code point [3]
          case "STR$": // String representation of number
          case "VAL": // Parse string into number
          case "FRE": // Garbage collect strings (returns 0)
          case "PDL": // Paddle position (paddle number)
          case "POS": // Horizontal cursor position
          case "USR": // Execute assembly code at address, return accumulator value
            oper = nextToken(tokens);
            token = nextToken(tokens);
            if(matchValueTokenNot(token,'(')) {
              throw new SyntaxError('Expecting ( in line ' + parseLinNum);
            }
            param.push(parseValue(tokens));
            token = nextToken(tokens);
            if (matchValueTokenNot(token,')')) {
              throw new SyntaxError('Expecting ) in line ' + parseLinNum);
            }
            return {
              type: oper.value,
              value: param[0]
            };

          case "LEFT$": // Left portion of (string, length)
          case "RIGHT$": // Right portion of (string, length)
          case "SCRN": // Lores color at pixel (x,y)
          case "HSCRN": // Hires color at pixel (x,y) [4]
            oper = nextToken(tokens);
            token = nextToken(tokens);
            if(matchValueTokenNot(token,'(')) {
              throw new SyntaxError('Expecting ( in line ' + parseLinNum);
            }
            param.push(parseValue(tokens));
            token = nextToken(tokens);
            if (matchValueTokenNot(token,',')) {
              throw new SyntaxError('Expecting , in line ' + parseLinNum);
            }
            param.push(parseValue(tokens));
            token = nextToken(tokens);
            if (matchValueTokenNot(token,')')) {
              throw new SyntaxError('Expecting ) in line ' + parseLinNum);
            }
            return {
              type: oper.value,
              param1: param[0],
              param2: param[1]
            };

          case "MID$": // Substring of (string, start character, length)
            oper = nextToken(tokens);
            token = nextToken(tokens);
            if(matchValueTokenNot(token,'(')) {
              throw new SyntaxError('Expecting ( in line ' + parseLinNum);
            }
            param.push(parseValue(tokens));
            token = nextToken(tokens);
            if (matchValueTokenNot(token,',')) {
              throw new SyntaxError('Expecting , in line ' + parseLinNum);
            }
            param.push(parseValue(tokens));
            token = nextToken(tokens);
            if (matchValueTokenNot(token,',')) {
              throw new SyntaxError('Expecting , in line ' + parseLinNum);
            }
            param.push(parseValue(tokens));
            token = nextToken(tokens);
            if (matchValueTokenNot(token,')')) {
              throw new SyntaxError('Expecting ) in line ' + parseLinNum);
            }
            return {
              type: oper.value,
              param1: param[0],
              param2: param[1],
              param3: param[2]
            };

          case "FN": // Execute user defined function [1]
            var functName, functVal;
            oper = nextToken(tokens);
            functName = parseIdentifier(tokens);
            token = nextToken(tokens);
            if(matchValueTokenNot(token,'(')) {
              throw new SyntaxError('Expecting ( in line ' + parseLinNum);
            }
            functVal = parseValue(tokens);
            token = nextToken(tokens);
            if (matchValueTokenNot(token,')')) {
              throw new SyntaxError('Expecting ) in line ' + parseLinNum);
            }
            return {
              type: oper.value,
              name: functName,
              value: functVal
            }

          default:
            throw new SyntaxError(token.value + ' not expected in line ' + parseLinNum);
        }
      }

      if(!token) {
        return token;
      }

      throw new SyntaxError('Parse error, can not process token ' + token.value + ' in line ' + parseLinNum);

    }

    function nextToken(tokens) {
      if (tokenIndex >= tokens.length) {
        return undefined;
      }
      return tokens[tokenIndex++];
    }

    function peekToken(tokens) {
      if (tokenIndex >= tokens.length) {
        return undefined;
      }
      return tokens[tokenIndex];
    }

    for(var iLine = 0; iLine < lines.length; iLine++) {
      ASTree.push(parseLine(lines[iLine]));
    }

    return ASTree;

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

  basic.run = function(tree) {
    //console.log(tree);
    var indexI;
    var runLinNum;

    var GoToFLAG = undefined;
    var EndFLAG = undefined;
    var ErrFLAG = undefined;
    var StopFLAG = undefined;
    var InputFLAG = undefined;
    var TraceFLAG = 0;

    var GoSubFLAG = [];
    var ForFLAG = [];


    function runStatement(expr) {
      runType(expr);
    }

    function runType(expr) {
      //console.log(expr);

      if(GoToFLAG !== undefined || EndFLAG || InputFLAG !== undefined) {
        return;
      }

      switch(expr.type) {
        case 'Number':
          return runNumber(expr.value);
        case 'String':
          return runString(expr.value);
        case 'Identifier':
          return runIdentifier(expr.value);
        case 'Not':
          return runNot(expr.value);
        case 'Logic':
          return runLogic(expr.operator, expr.left, expr.right);
        case 'Comparison':
          return runComparison(expr.operator, expr.left, expr.right);
        case 'SumSub':
          return runSumSub(expr.operator,expr.left,expr.right);
        case 'MultDiv':
          return runMultDiv(expr.operator,expr.left,expr.right);
        case 'PowerTo':
          return runPowerTo(expr.left,expr.right);
        case "ABS": // Absolute value of number
          return runAbs(expr.value);
        case "ASC": // ASCII code for first character of string
          return runAsc(expr.value);
        case "ATN": // Arctangent of number
          return runAtn(expr.value);
        case "COS": // Cosine of number
          return runCos(expr.value);
        case "EXP": // Raise e to number
          return runExp(expr.value);
        case "INT": // Integer part of number
          return runInt(expr.value);
        case "LOG": // Natural log of number
          return runLog(expr.value);
        case "RND": // Pseudo-random number generator (0 repeats last, negative reseeds)
          return runRnd(expr.value);
        case "SGN": // Sign of number (-1,0,1)
          return runSgn(expr.value);
        case "SIN": // Sine of number
          return runSin(expr.value);
        case "SQR": // Square root of number
          return runSqr(expr.value);
        case "TAN": // Tangent of number
          return runTan(expr.value);
        case "LEN": // Length of string
          return runLen(expr.value);
        case "CHR$": // Character at specified ASCII code point [3]
          return runChr(expr.value);
        case "STR$": // String representation of number
          return runStr(expr.value);
        case "VAL": // Parse string into number
          return runVal(expr.value);
        case "LEFT$": // Left portion of (string, length)
          return runLeft(expr.param1, expr.param2);
        case "RIGHT$": // Right portion of (string, length)
          return runRight(expr.param1, expr.param2);
        case "MID$": // Substring of (string, start character, length)
          return runMid(expr.param1, expr.param2, expr.param3);
        case "FN": // Execute user defined function [1]
          return runFn(expr.name, expr.value);
        case 'Separator':
          return runSeparator(expr.left, expr.right);
        case 'Assigment':
          return runAssigment(expr.identifier, expr.value);
        case 'Print':
          return runPrint(expr.parameters);
        case 'CLEAR': // Clear all variables
          return runClear();
        case 'END': // Terminate program cleanly
          return runEnd();
        case 'STOP': // Break, as if an error occurred
          return runStop();
        case 'RETURN': // Return from subroutine
          return runReturn();
        case 'POP': // Convert last GOSUB into a GOTO
          return runPop();
        case 'HOME': // Clear text display
          return runHome();
        case 'GOTO': // Jump to line number
          return runGoTo(expr.expression);
        case 'GOSUB': // Enter subroutine at line number
          return runGoSub(expr.expression);
        case 'HTAB': // Position text cursor horizontally (1...40 or 1...80)
        case 'VTAB': // Position text cursor vertically (1...24)
        case 'COLOR=': // Set lores color (0...15)
        case 'HCOLOR=': // Set hires color (0...7)
        case 'SPEED=': // Set character output delay - has no effect
        case 'CALL': // Call native routine
        case 'PR#': // Direct output to slot
        case 'INVERSE': // Set output mode to black-on-white
        case 'FLASH': // Set output mode to flashing
        case 'NORMAL': // Set output mode to white-on-black
        case 'TEXT': // Set display to text mode
        case 'GR': // Set display to mixed test/low resolution ("lores") graphics mode, clear screen to black
        case 'HGR': // Set display to mixed/high resolution ("hires") graphics mode, clear screen to black
        case 'HGR2': // Set display to full hires mode (page 2), clear screen to black
        case "PDL": // Paddle position (paddle number)
        case "POS": // Horizontal cursor position
        case "SCRN": // Lores color at pixel (x,y)
        case "HSCRN": // Hires color at pixel (x,y) [4]
          throw expr.type + ' not implemented';
        case "FRE": // Garbage collect strings (returns 0)
        case 'RESTORE': // Restore the DATA pointer to the first value
        case "PEEK": // Value at memory location
          throw expr.type + ' not implemented';
        case 'TRACE': // Turn on trace mode (line numbers printed)
          return runTrace();
        case 'NOTRACE': // Turn off trace mode
          return runNoTrace();
        case 'Comment': // Begin a comment; rest of line is skipped
          return;
        case 'Poke': // Set memory location to value
        case 'Read': // Read the next DATA value
        case 'Data': // Define inline data. Values can be literals (unquoted strings), strings, or numbers
        case 'HPlot': // Plot hires point/line (x=0...279, y=0...191)
        case 'VHLin': // Plot vertical/horizontal line (x1, x2 at y)
        case 'Plot': // Plot lores point (x = 0...39, y = 0...39/47)
        case 'Get': // Read single key
          throw expr.type + ' not implemented';
        case 'Input': // Read line of comma-delimited input, with optional prompt
          return runInput(expr.question,expr.parameters);
        case 'OnErr': // Set error hook
          return runOnErr(expr.expression);
        case 'RESUME': // Retry line that caused ONERR GOTO
          return runResume();
        case 'On': // Branch based on index (value = 1, 2, ...) --- Subroutine branch based on index (value = 1, 2, ...)
          return runOn(expr.value, expr.secondOperator, expr.parameters);
        case 'IfThen': // Conditional; if expr is false, rest of line is skipped
          return runIfThen(expr.expression, expr.statement);
        case 'IfGoTo': // Conditional; if expr is false, rest of line is skipped
          return runIfGoTo(expr.expression, expr.lineNumber);
        case 'For': // Loop with counter variable
          return runFor(expr.initVariable, expr.initValue, expr.endValue, expr.step);
        case 'Next': // End of loop(s)
          return runNext(expr.parameters);
        case 'Dim': // Allocate array(s) with given dimension(s)
          throw expr.type + ' not implemented';
        case 'DefFn': // Define function of a single variable
          return runDefFn(expr.name, expr.identifier, expr.expression);
        case "USR": // NOT IMPLEMENTED - Execute assembly code at address, return accumulator value
        case 'ROT=': // NOT IMPLEMENTED - Set hires shape table rotation (0...63)
        case 'SCALE=': // NOT IMPLEMENTED - Set hires shape table scale (1...255)
        case 'Draw': // NOT IMPLEMENTED - Draw hires shape table shape in color
        case 'XDRaw': // NOT IMPLEMENTED - Draw hires shape table shape with XOR
        case 'CONT': // NOT IMPLEMENTED - Continue from a STOP
        case 'DEL': // NOT IMPLEMENTED - Delete lines of program
        case 'List': // NOT IMPLEMENTED - List lines of program
        case 'NEW': // NOT IMPLEMENTED - Clear program and variables
        case 'Run': // NOT IMPLEMENTED - Start program execution at line
        case 'HIMEM:': // NOT IMPLEMENTED - Set upper address of variable memory
        case 'IN#': // NOT IMPLEMENTED - Direct input from slot
        case 'LOMEM:': // NOT IMPLEMENTED - Set lower address of variable memory
        case 'Wait': // NOT IMPLEMENTED - Wait until memory location masked by second argument equals third argument (or zero)
        case 'LOAD': // NOT IMPLEMENTED - Load program from cassette
        case 'RECALL': // NOT IMPLEMENTED - Load variables from cassette
        case 'SAVE': // NOT IMPLEMENTED - Save program to cassette
        case 'STORE': // NOT IMPLEMENTED - Save variables to cassette
        case 'SHLOAD': // NOT IMPLEMENTED - Load hires shape table from cassette
          throw expr.type + ' not implemented';
        default:
          throw new SyntaxError(token.value + ' not expected');
      }
    }

    function runNumber(value) {
      return {
        type: 'Number',
        value: value
      };
    }

    function runString(value) {
      return {
        type: 'String',
        value: value
      }
    }

    function runIdentifier(identifier) {
      var value;
      value = getVariable(identifier);
      return {
        type: 'Number',
        value: value
      };
    }

    function runNot(exp) {
      var val, result;
      val = runType(exp);

      if(val.value === 0) {
        result = 1;
      } else {
        result = 0;
      }

      return {
        type:'Number',
        value: result
      }
    }

    function runLogic(logicOp, leftExp, rightExp) {
      var leftVal, rightVal, result;
      leftVal = runType(leftExp);
      rightVal = runType(rightExp);

      if(!matchTypeToken(leftVal, 'Number') || !matchTypeToken(rightVal, 'Number')) {
        throw 'Expected number, in line ' + runLinNum;
      }

      switch(logicOp) {
        case 'AND':
          if((leftVal.value !== 0) && (rightVal.value !== 0)) {
            result = 1;
          } else {
            result = 0;
          }
          break;
        case 'OR':
          if((leftVal.value !== 0) || (rightVal.value !== 0)) {
            result = 1;
          } else {
            result = 0;
          }
      }

      return {
        type: 'Number',
        value: result
      }
    }

    function runComparison(compOp, leftExp, rightExp) {
      var leftVal, rightVal, result;
      leftVal = runType(leftExp);
      rightVal = runType(rightExp);

      if(leftVal.type !== rightVal.type) {
        throw 'values must have the same type, in line ' + runLinNum;
      }

      switch(compOp) {
        case '>':
        case '>>':
          if(leftVal.value > rightVal.value) {
            result = 1;
          } else {
            result = 0;
          }
          break;
        case '<':
        case '<<':
          if(leftVal.value < rightVal.value) {
            result = 1;
          } else {
            result = 0;
          }
          break;
        case '=':
        case '==':
          if(leftVal.value === rightVal.value) {
            result = 1;
          } else {
            result = 0;
          }
          break;
        case '><':
        case '<>':
          if(leftVal.value !== rightVal.value) {
            result = 1;
          } else {
            result = 0;
          }
          break;
        case '>=':
        case '=>':
          if(leftVal.value >= rightVal.value) {
            result = 1;
          } else {
            result = 0;
          }
          break;
        case '<=':
        case '=<':
          if(leftVal.value <= rightVal.value) {
            result = 1;
          } else {
            result = 0;
          }
      }

      return {
        type: 'Number',
        value: result
      }
    }

    function runSumSub(operator, leftExp, rightExp) {
      var leftVal, rightVal, result;
      leftVal = runType(leftExp);
      rightVal = runType(rightExp);

      if(leftVal.type !== rightVal.type) {
        throw 'values must have the same type, in line ' + runLinNum;
      }

      switch(operator) {
        case '+':
          result = leftVal.value + rightVal.value;
          break;
        case '-':
          if(!matchTypeToken(leftVal, 'Number') || !matchTypeToken(rightVal, 'Number')) {
            throw 'expected number, in line ' + runLinNum;
          }
          result = leftVal.value - rightVal.value;
      }
      
      return {
        type: leftVal.type,
        value: result
      }
    }

    function runMultDiv(operator, leftExp, rightExp) {
      var leftVal, rightVal, result;
      leftVal = runType(leftExp);
      rightVal = runType(rightExp);

      if(!matchTypeToken(leftVal, 'Number') || !matchTypeToken(rightVal, 'Number')) {
        throw 'expected number, in line ' + runLinNum;
      }

      switch(operator) {
        case '*':
          result = leftVal.value * rightVal.value;
          break;
        case '/':
          result = leftVal.value / rightVal.value;
      }
      
      return {
        type: 'Number',
        value: result
      }
    }

    function runPowerTo(leftExp, rightExp) {
      var leftVal, rightVal, result;
      leftVal = runType(leftExp);
      rightVal = runType(rightExp);

      if(!matchTypeToken(leftVal, 'Number') || !matchTypeToken(rightVal, 'Number')) {
        throw 'expected number, in line ' + runLinNum;
      }

      result = Math.pow(leftVal.value,rightVal.value);
      
      return {
        type: 'Number',
        value: result
      }
    }

    function runAbs(exp) {
      var val, result;
      val = runType(exp);

      if(!matchTypeToken(val, 'Number')) {
        throw 'expected number, in line ' + runLinNum;
      }

      result = Math.abs(val.value);

      return {
        type: val.type,
        value: result
      }
    }

    function runAsc(exp) {
      var val, result;
      val = runType(exp);

      if(!matchTypeToken(val, 'String')) {
        throw 'expected string, in line ' + runLinNum;
      }

      result = val.value.charCodeAt(0);

      return {
        type: val.type,
        value: result
      }
    }

    function runAtn(exp) {
      var val, result;
      val = runType(exp);

      if(!matchTypeToken(val, 'Number')) {
        throw 'expected number, in line ' + runLinNum;
      }

      result = Math.atan(val.value);

      return {
        type: val.type,
        value: result
      }
    }

    function runCos(exp) {
      var val, result;
      val = runType(exp);

      if(!matchTypeToken(val, 'Number')) {
        throw 'expected number, in line ' + runLinNum;
      }

      result = Math.cos(val.value);

      return {
        type: val.type,
        value: result
      }
    }

    function runExp(exp) {
      var val, result;
      val = runType(exp);

      if(!matchTypeToken(val, 'Number')) {
        throw 'expected number, in line ' + runLinNum;
      }

      result = Math.exp(val.value);

      return {
        type: val.type,
        value: result
      }
    }

    function runInt(exp) {
      var val, result;
      val = runType(exp);

      if(!matchTypeToken(val, 'Number')) {
        throw 'expected number, in line ' + runLinNum;
      }

      result = Math.floor(val.value);

      return {
        type: val.type,
        value: result
      }
    }

    function runLog(exp) {
      var val, result;
      val = runType(exp);

      if(!matchTypeToken(val, 'Number')) {
        throw 'expected number, in line ' + runLinNum;
      }

      result = Math.log(val.value);

      return {
        type: val.type,
        value: result
      }
    }

    function runRnd(exp) {
      var val, result;
      val = runType(exp);

      if(!matchTypeToken(val, 'Number')) {
        throw 'expected number, in line ' + runLinNum;
      }

      result = Math.random();

      return {
        type: 'Number',
        value: result
      }
    }

    function runSgn(exp) {
      var val, result;
      val = runType(exp);

      if(!matchTypeToken(val, 'Number')) {
        throw 'expected number, in line ' + runLinNum;
      }

      result = val.value?val.value<0?-1:1:0;

      return {
        type: val.type,
        value: result
      }
    }

    function runSin(exp) {
      var val, result;
      val = runType(exp);

      if(!matchTypeToken(val, 'Number')) {
        throw 'expected number, in line ' + runLinNum;
      }

      result = Math.sin(val.value);

      return {
        type: val.type,
        value: result
      }
    }

    function runSqr(exp) {
      var val, result;
      val = runType(exp);

      if(!matchTypeToken(val, 'Number')) {
        throw 'expected number, in line ' + runLinNum;
      }

      result = Math.sqrt(val.value);

      return {
        type: val.type,
        value: result
      }
    }

    function runTan(exp) {
      var val, result;
      val = runType(exp);

      if(!matchTypeToken(val, 'Number')) {
        throw 'expected number, in line ' + runLinNum;
      }

      result = Math.tan(val.value);

      return {
        type: val.type,
        value: result
      }
    }

    function runLen(exp) {
      var val, result;
      val = runType(exp);

      if(!matchTypeToken(val, 'String')) {
        throw 'expected string, in line ' + runLinNum;
      }

      result = (val.value).length;

      return {
        type: 'Number',
        value: result
      }
    }

    function runChr(exp) {
      var val, result;
      val = runType(exp);

      if(!matchTypeToken(val, 'Number')) {
        throw 'expected number, in line ' + runLinNum;
      }

      result = String.fromCharCode(val.value);

      return {
        type: 'String',
        value: result
      }
    }

    function runStr(exp) {
      var val, result;
      val = runType(exp);

      if(!matchTypeToken(val, 'Number')) {
        throw 'expected number, in line ' + runLinNum;
      }

      result = (val.value).toString();

      return {
        type: 'Number',
        value: result
      }
    }

    function runVal(exp) {
      var val, result;
      val = runType(exp);

      if(!matchTypeToken(val, 'String')) {
        throw 'expected string, in line ' + runLinNum;
      }

      result = parseInt(val.value);

      return {
        type: 'Number',
        value: result
      }
    }

    function runFn(name, expr) {
      var val, funct, oldIdentValue, result;
      val = runType(expr);
      funct = getFunction(name.value);

      oldIdentValue = getVariable(funct.identifier);
      setVariable(funct.identifier, val.value);
      result = runType(funct.expression);
      setVariable(funct.identifier, oldIdentValue);

      return result;
    }

    function runSeparator(leftExp, rightExp) {
      runType(leftExp);
      runType(rightExp);
    }

    function runAssigment(ident, exp) {
      var val;
      val = runType(exp);

      if(!matchTypeToken(ident, 'Identifier')) {
        throw 'expected identifier, in line ' + runLinNum;
      }

      if(!matchTypeToken(val, 'Number')) {
        throw 'expected number, in line ' + runLinNum;
      }

      setVariable(ident.value,val.value);
    }

    function runPrint(param) {
      var result = "";
      for(var i = 0; i < param.length; i++) {
        var value;
        value = runType(param[i]);
        result = result + (value.value).toString();
      }
      addOutput(result + '\n');
    }

    function runGoTo(exp) {
      var result = undefined;

      //console.log(exp);
      if(exp.value < 0 || ((exp.value)%1) !== 0) {
        throw 'expected lineNumber, in line ' + runLinNum;
      }

      for(var i = 0; i < tree.length; i++) {
        if(tree[i].lineNumber === exp.value) {
          result = i;
          break;
        }
      }

      if(result !== undefined) {
        GoToFLAG = result;
      } else {
        throw 'line number not defined, in line ' + runLinNum;
        GoToFLAG = tree.length;
      }
    }

    function runGoSub(exp) {
      var result = undefined;

      if(exp.value < 0 || ((exp.value)%1) !== 0) {
        throw 'expected lineNumber, in line ' + runLinNum;
      }

      for(var i = 0; i < tree.length; i++) {
        if(tree[i].lineNumber === exp.value) {
          result = i;
          break;
        }
      }

      if(result !== undefined) {
        GoSubFLAG.push(indexI);
        GoToFLAG = result;
      } else {
        throw 'line number not defined, in line ' + runLinNum;
        GoToFLAG = tree.length;
      }
    }

    function runClear() {
      clearVariables();
    }

    function runIfThen(exp, stat) {
      var val;
      val = runType(exp);
      if(val.value) {
        runType(stat);
      }
    }

    function runIfGoTo(exp, lineNum) {
      var val;
      val = runType(exp);
      if(val.value) {
        runGoTo(lineNum);
      }
    }

    function runFor(ident, expInitVal, expEndVal, expStep) {
      var initVal, endVal, stepVal, ind, startPoint, oldFlag;
      initVal = runType(expInitVal);
      endVal = runType(expEndVal);
      stepVal = runType(expStep);

      if(!matchTypeToken(ident, 'Identifier')) {
        throw 'expected identifier, in line ' + runLinNum;
      }

      if( !matchTypeToken(initVal, 'Number') ||
          !matchTypeToken(endVal, 'Number') ||
          !matchTypeToken(stepVal, 'Number') ) {
        throw 'expected number, in line ' + runLinNum;
      }

      setVariable(ident.value, initVal.value);

      ForFLAG.push({
        variable: ident.value,
        end: endVal.value,
        step: stepVal.value,
        line: indexI});

    }

    function runDefFn(name, ident, expr) {
      setFunctions(name.value, ident.value, expr);
    }

    function runHome() {
      clearOutput();
    }

    function runLeft(exprStr, exprVal) {
      var str, val, result;
      str = runType(exprStr);
      val = runType(exprVal);

      if(!matchTypeToken(str, 'String')) {
        throw 'expected string, in line ' + runLinNum;
      }
      if(!matchTypeToken(val, 'Number')) {
        throw 'expected number, in line ' + runLinNum;
      }

      result = (str.value).substr(0, val.value);

      return {
        type: 'String',
        value: result
      };
    }

    function runRight(exprStr, exprVal) {
      var str, val, result;
      str = runType(exprStr);
      val = runType(exprVal);

      if(!matchTypeToken(str, 'String')) {
        throw 'expected string, in line ' + runLinNum;
      }
      if(!matchTypeToken(val, 'Number')) {
        throw 'expected number, in line ' + runLinNum;
      }

      result = str.value
              .split("").reverse().join("")
              .substr(0, val.value)
              .split("").reverse().join("");

      return {
        type: 'String',
        value: result
      };
    }

    function runMid(exprString, exprStrat, exprEnd) {
      var str, start, end, result;
      str = runType(exprString);
      start = runType(exprStrat);
      end = runType(exprEnd);

      if(!matchTypeToken(str, 'String')) {
        throw 'expected string, in line ' + runLinNum;
      }
      if(!matchTypeToken(start, 'Number')) {
        throw 'expected number, in line ' + runLinNum;
      }
      if(!matchTypeToken(end, 'Number')) {
        throw 'expected number, in line ' + runLinNum;
      }

      result = "";
      for(var i = 0; i < ((str.value).length-start.value+1) && i < end.value; i++) {
        var j = i + start.value;
        if(j > 0){
          result += (str.value)[j-1];
        }
      }

      return {
        type: 'String',
        value: result
      };
    }

    function runReturn() {
      var result = GoSubFLAG.pop();
      if(result > -1) {
        GoToFLAG = result+1;
      } else {
        throw 'Return not associated to any subrotine, in line ' + runLinNum;
      }
    }

    function runPop() {
      GoSubFLAG.pop();
    }

    function runEnd() {
      EndFLAG = 1;
    }

    function runNext(param) {
      var forVal = ForFLAG[ForFLAG.length - 1];
      var paramIndex = 0;

      if(param.length > paramIndex) {
        while(param.length > paramIndex) {
          forVal = ForFLAG[ForFLAG.length - 1];

          if(forVal) {
            if(forVal.variable === param[paramIndex].value) {

              var result = getVariable(forVal.variable);
              result += forVal.step;
              setVariable(forVal.variable, result);

              if(result > forVal.end) {
                ForFLAG.pop();
                paramIndex += 1;
              } else {
                GoToFLAG = forVal.line+1;
                return;
              }
            } else {
              ForFLAG.pop();
            }
          } else {
            throw 'Next not associated to any for, in line ' + runLinNum;
          }
        }
      } else {
        if(forVal) {
          var result = getVariable(forVal.variable);
          result += forVal.step;
          setVariable(forVal.variable, result);

          if(result > forVal.end) {
            ForFLAG.pop();
          } else {
            GoToFLAG = forVal.line+1;
          }
        } else {
          throw 'Next not associated to any for, in line ' + runLinNum;
        }
      }
    }

    function runStop() {
      if(ErrFLAG) {
        runGoTo(ErrFLAG);
        StopFLAG = indexI;
      } else {
        throw 'STOP without hock, , in line ' + runLinNum;
      }
    }

    function runOnErr(exp) {
      ErrFLAG = exp;
    }

    function runResume() {
      GoToFLAG = StopFLAG+1;
    }

    function runTrace() {
      TraceFLAG = 1;
    }

    function runNoTrace() {
      TraceFLAG = 0;
    }

    function runOn(exp, ope, param) {
      var val;
      val = runType(exp);

      console.log(val);

      if(!matchTypeToken(val, 'Number')) {
        throw 'expected number, in line ' + runLinNum;
      }

      if(!(val.value > 0 && val.value < param.length)) {
        throw 'expect a number between the range, in line ' + runLinNum;
      }

      switch(ope.value) {
        case 'GOTO':
          return runGoTo(param[val.value-1]);
        case 'GOSUB':
          return runGoSub(param[val.value-1]);
        default:
          throw 'unexpect error, in line ' + runLinNum;
      }
    }

    function runInput(quest, param) {
      codeOutput.doc.setValue(codeOutput.doc.getValue() + quest.value + ": ");

      var inputArray = [];
      var input = [];

      codeOutput.on("change", detectInput);

      function detectInput(cm, changedObject) {
        if (changedObject.text.length == 2 && changedObject.text[0] == "" && changedObject.text[1] == "") {
          //input = inputArray.join("").split(" ");
          input = parseFloat(inputArray.join(""));
          inputArray = [];
          //console.log(input);
          codeOutput.off("change", detectInput);
          processInput(input);
        } else {
          inputArray.push(changedObject.text[0]);
        }
      }

      function processInput(input) {
        if(param.length > 0 && input !== undefined) {
          setVariable(param[0].value, input); 
          param = param.slice(1,param.length);
        } else {
          if(InputFLAG !== undefined) {
            codeOutput.doc.setValue(codeOutput.doc.getValue() + ": ");
            codeOutput.on('change', detectInput);
          }
          return;
        }

        if (param.length === 0) {
          var cont = InputFLAG+1;
          InputFLAG = undefined;
          codeOutput.off("change", detectInput);
          runTree(cont);
          return;
        }
        codeOutput.on('change', detectInput);
      }

      InputFLAG = indexI;

    }

    function runTree(start) {
      for(var i = start; i < tree.length; i++) {
        indexI = i;
        runLinNum = tree[i].lineNumber;
        if(TraceFLAG) {
          addOutput('#' + runLinNum + ' ');
        }
        runStatement(tree[i].statement);
        if(GoToFLAG !== undefined) {
          i = GoToFLAG-1;
          GoToFLAG = undefined;
        }

        if ( EndFLAG || InputFLAG !== undefined) {
          return;
        }
      }
    }

    runTree(0);
  }

  basic.compile = function(source, codeOut) {

    //console.log(test.hello());

    //console.log([{type: "Number", value: 2}, {type: "Operator", value: '+'}, {type: "Number", value: 2}]);
    
    var tokens, lines, tree;
    codeOutput = codeOut;
    //console.log("--------- SOURCE ----------");
    //console.log(source);
    //console.log("--------- TOKENIZER ------------");
    tokens = basic.tokenizer(source);
    console.log(tokens);
    ast_parser.parseExpr(tokens);
    //console.log("--------- PARSE LINES ------------");
    /*lines = basic.divideByLines(tokens);
    tree = basic.ASTparser(lines);
    //console.log(tree);
    //console.log("--------- RUN LINES ------------");
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