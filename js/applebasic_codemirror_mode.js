CodeMirror.defineMode('applebasic', function(config, parserConfig) {

  var STATEMENT = 'applebasic-statement',
      OPERATOR = 'applebasic-operator',
      FUNCTION = 'applebasic-function',
      UNSUPPORTED = 'applebasic-unsupported';


  var reservedKeywords = {
    "CLEAR": STATEMENT, // Clear all variables
    "LET": STATEMENT, // Assign variable
    "DIM": STATEMENT, // Allocate array(s) with given dimension(s)
    "DEF": STATEMENT, // Define function of a single variable [1]
    "GOTO": STATEMENT, // Jump to line number
    "GOSUB": STATEMENT, // Enter subroutine at line number
    "RETURN": STATEMENT, // Return from subroutine
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
    "ON": STATEMENT, // Branch based on index (value = 1, 2, ...)
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
    "HGR2": STATEMENT, // Set display to full hires mode (page 2), clear screen to black
    "HGR": STATEMENT, // Set display to mixed/high resolution ("hires") graphics mode, clear screen to black
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
    "AT": STATEMENT, // HLIN aexpr, aexpr AT aexpr
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

  return {

    startState: function () {
      return {
        state: 'normal'
      };
    },

    token: function (stream, state) {
      if (state.state === 'normal') {
        if (stream.eatSpace()) {
          return null;
        }
      }

      if (stream.match(/^[-+]?\d*\.?\d+([eE][-+]?\d+)?/, true)) {
        return 'applebasic-number';
      }

      if (stream.match(/^[;=+<>\-*\/\^,()]/, true)) {
        return 'applebasic-operator';
      }

      if (stream.match(/^:/, true)) {
        return 'applebasic-separator';
      }

      if (stream.match(/^"([^"]*?)(?:"|(?=\n|\r|$))/, true)) {
        return 'applebasic-string';
      }

      for (key in reservedKeywords) {
        if (Object.hasOwnProperty.call(reservedKeywords, key)) {
          if (stream.match(key, true, true)) {
            return reservedKeywords[key];
          }
        }
      }

      stream.next();

    },

  }

});

CodeMirror.defineMIME('text/x-basic', 'applebasic');
CodeMirror.defineMIME('text/x-applesoft', 'applebasic');
CodeMirror.defineMIME('text/x-applebasic', 'applebasic');