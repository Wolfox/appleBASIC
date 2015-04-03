tokenizer.util = (function() {

  tok = {};

  tok.tokenizer = function(source) {
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

  return tok;

}());