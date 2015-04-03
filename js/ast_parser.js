this.ast_parser = (function() {

  parser = {};

  var lazy = Parsimmon.lazy;

  function parseValueToken(value) {
    return Parsimmon.custom(function(success, failure) {
      return function(stream, i) {
        if(matchValueToken(stream[i],value)) {
          return success(i+1, value);
        }
        return failure(i, 'expected ' + value);
      }
    });
  }

  function parseFunction(functionName) {
    return Parsimmon.custom(function(success, failure) {
      return function(stream, i) {
        if(matchTypeToken(stream[i],tokenType.ReservedKeyword) && matchValueToken(stream[i],functionName)) {
          return success(i+1, functionName);
        }
        return failure(i, 'expected ' + functionName);
      }
    });
  }

  function parseStatement(statementName) {
    return Parsimmon.custom(function(success, failure) {
      return function(stream, i) {
        if(matchTypeToken(stream[i],tokenType.ReservedKeyword) && matchValueToken(stream[i],statementName)) {
          return success(i+1, statementName);
        }
        return failure(i, 'expected ' + statementName);
      }
    });
  }

  function insertInit(array,value) {
    var result = array;
    result.unshift(value);
    return result;
  }







  function matchValueToken(token, value) {
    return (token !== undefined && token.value === value);
  }

  function matchTypeToken(token, type) {
    return (token !== undefined && token.type === type);
  }

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

  var parseLineNumber = Parsimmon.custom(function(success, failure) {
    return function(stream, i) {
      if(stream[i].type === "LineNumber") {
        return success(i+1,
          {
            type: 'LineNumber',
            value: stream[i].value
          });
      }
      return failure(i, 'expected LineNumber');
    }
  });






  var parseInput = lazy(function() { // INPUT [string ;] var [, var ...]
    return Parsimmon.seq(
      parseStatement('INPUT'),
      parseInputQuestion.or(Parsimmon.success( {type: 'String', value: ""} )),
      parseIdentifier,
      parseInputAux).map(function(result) {
        return {
          type: 'Input',
          question: result[1],
          parameters: insertInit(result[3],result[2])
        };
      });
  });

  var parseInputQuestion = lazy(function() {
    return Parsimmon.seq(
      parseUnit(tokenType.Strings, 'String').skip(parseValueToken(';')));
  });

  var parseInputAux = lazy(function() {
    return parseComa.then(parseIdentifier).many();
  });

  var parseGet = lazy(function() { // GET var
    return Parsimmon.seq(
      parseStatement('GET'),
      parseIdentifier).map(function(result) {
        return {
          type: 'Get',
          value: result[1]
        };
      });
  });

  var parsePrint = lazy(function() { // PRINT expr [ [;,] expr ... ] [;]
    return Parsimmon.seq(
      parseStatement('PRINT'),
      parseValue,
      parsePrintAux.many(),
      Parsimmon.succeed('').or(parseValueToken(';'))).map(function(result) {
        return {
          type: 'Print',
          parameters: insertInit(result[2], result[1]),
          isNewline: result[3]
        }
      });
  });

  var parsePrintAux = lazy(function() {
    return Parsimmon.seq(
      Parsimmon.alt(parseValueToken(';'), parseValueToken(','), Parsimmon.success('')),
      parseValue);
  });

  var parseOnError = lazy(function() { // ONERR GOTO linenum
    return Parsimmon.seq(
      parseStatement('ONERR'),
      parseStatement('GOTO'),
      parseValue).map(function(result) {
        return {
          type: 'OnErr',
          expression: result[2]
        };
      });
  });

  var parseOn = lazy(function() { // ON aexpr GOTO linenum [, linenum ...] ----- ON aexpr GOSUB linenum [, linenum ...]
    return Parsimmon.seq(
      parseStatement('ON'),
      parseValue,
      parseStatement('GOTO').or(parseStatement('GOSUB')),
      parseValue,
      parseOnAux).map(function(result) {
        return {
          type: 'On',
          value: result[1],
          secondOperator: result[2],
          parameters: insertInit(result[4],result[3])
        };
      });
  });

  var parseOnAux = lazy(function() { return parseComa.then(parseValue).many(); });

  var parseIf = lazy(function() { // IF expr THEN statement ----- IF expr GOTO linenum
    return Parsimmon.alt(parseIfThen, parseIfGoTo);
  });

  var parseIfThen = lazy(function() {// IF expr THEN statement
    return Parsimmon.seq(
      parseStatement('IF'),
      parseValue,
      parseStatement('THEN'),
      parseStatements).map(function(result) {
        return {
          type: 'IfThen',
          expression: result[1],
          statement: result[3]
        }
      });
  });

  var parseIfGoTo = lazy(function() {// IF expr GOTO linenum
    return Parsimmon.seq(
      parseStatement('IF'),
      parseValue,
      parseStatement('GOTO'),
      parseValue).map(function(result) {
        return {
          type: 'IfGoTo',
          expression: result[1],
          lineNumber: result[3]
        }
      });
  });

  var parseFor = lazy(function() { // FOR var = aexpr TO aexpr [ STEP aexpr ]
    return Parsimmon.seq(
      parseStatement('FOR'),
      parseIdentifier,
      parseValueToken('='),
      parseValue,
      parseStatement('TO'),
      parseValue,
      Parsimmon.success('').or(parseForStep)).map(function(result) {
        return {
          type: 'For',
          initVariable: identf,
          initValue: value1,
          endValue: value2,
          step: step
        };
      });
  });

  var parseForStep = lazy(function() {
    return Parsimmon.seq(
      parseStatement('Step'),
      parseValue);
  });

  var paseNext = lazy(function() { // NEXT [var [, var ...] ]
    return Parsimmon.seq(
      parseStatement('NEXT'),
      Parsimmon.success('').or(parseNextAux)).map(function(result) {
        return {
          type: 'Next',
          parameters: result[1]
        };
      });
  });

  var parseNextAux = lazy(function() {
    return Parsimmon.seq(parseIdentifier, parseComa.then(parseIdentifier).many()).map(function(result) {
      return insertInit(result[1], result[0]);
    });
  });

  var parseDim = lazy(function() { //DIM var( size [, size ...] ) [, var( size [, size ...] ) ...]
    return Parsimmon.seq(
      parseStatement('DIM'),
      parseDimAuxSingle,
      parseDimAux.many()).map(function(result) {
        return {
          type: 'Dim',
          parameters: insertInit(result[2], result[1])
        }
      });
  });

  var parseDimAux = lazy(function() { return parseComa.then(parseDimAuxSingle); });

  var parseDimAuxSingle = lazy(function() {
    return Parsimmon.seq(
      parseIdentifier,
      parseParenthesisBegin,
      parseDimSize,
      parseParenthesisEnd).map(function(result) {
        return {
          identifier: result[0],
          size: result[2]
        }
      });
  });

  var parseDimSize = lazy(function() {
    return Parsimmon.seq(
      parseDimSizeSingle,
      parseDimSizeAux.many()).map(function(result) { return insertInit(result[1], result[0]); });
  });

  var parseDimSizeAux = lazy(function() { return parseComa.then(parseDimSizeSingle); });

  var parseDimSizeSingle = lazy(function() { return parseValue; });

  var parseDef = lazy(function() { // DEF FN name(var) = aexpr
    return Parsimmon.seq(
      parseStatement('DEF'),
      parseFunction('FN'),
      parseAssigment,
      parseParenthesisBegin,
      parseIdentifier,
      parseParenthesisEnd,
      parseValueToken('='),
      parseValue).map(function(result) {
        return {
          type: 'DefFn',
          name: result[2],
          identifier: result[4],
          expression: result[7]
        };
      });
  });

  var parseIdentifier = lazy(function() { return parseUnit(tokenType.Identifier, 'Identifier'); });

  var parseAssigment = lazy(function() {
    return Parsimmon.seq(parseIdentifier, parseValueToken('='), parseValue);
  });

  var parseMultStatments = lazy(function() {
    return Parsimmon.alt(parseMultStatmentsAux, parseSingleStatment);
  });

  var parseMultStatmentsAux = lazy(function() {
    return Parsimmon.seq(parseSingleStatment, parseValueToken(':'), parseMultStatments).map(function(result) {
      return {
        type: 'Separator',
        left: result[0],
        right: result[2]
      }
    });
  });

  var parseValue = lazy(function() { return parseLogicOp; });

  var parseLogicOp = lazy(function() {
    return Parsimmon.alt(parseLogicOpAux, parseComp);
  });

  var parseLogicOpAux = lazy(function() {
    return Parsimmon.seq(parseComp, parseValueToken('AND').or(parseValueToken('OR')), parseLogicOp).map(function(result) {
      return {
        type: 'Logic',
        operator: result[1],
        left: result[0],
        right: result[2]
      }
    });
  });

  var parseComp = lazy(function() {
    return Parsimmon.alt(parseCompAux, parseSumSub);
  });

  var parseComparison = Parsimmon.alt(parseValueToken('>'), parseValueToken('<'), parseValueToken('=')).times(1,2).map(function(result) {
    return result.join('');
  });

  var parseCompAux = lazy(function() {
    return Parsimmon.seq(parseSumSub, parseComparison, parseComp).map(function(result) {
      return {
        type: 'Comparison',
        operator: result[1],
        left: result[0],
        right: result[2]
      }
    });
  });

  var parseSumSub = lazy(function() {
    return Parsimmon.alt(parseSumSubAux, parseMultDiv);
  });

  var parseSumSubAux = lazy(function() {
    return Parsimmon.seq(parseMultDiv, parseValueToken('+').or(parseValueToken('-')), parseSumSub).map(function(result) {
      return {
        type: 'SumSub',
        operator: result[1],
        left: result[0],
        right: result[2]
      }
    });
  });

  var parseMultDiv = lazy(function() {
    return Parsimmon.alt(parseMultDivAux, parsePower);
  });

  var parseMultDivAux = lazy(function() {
    return Parsimmon.seq(parsePower, parseValueToken('*').or(parseValueToken('/')), parseMultDiv).map(function(result) {
      return {
        type: 'MultDiv',
        operator: result[1],
        left: result[0],
        right: result[2]
      }
    });
  });

  var parsePower = lazy(function() {
    return Parsimmon.alt(parsePowerAux, parseUnits);
  });

  var parsePowerAux = lazy(function() {
    return Parsimmon.seq(parseUnits, parseValueToken('^'), parsePower).map(function(result) {
      return {
        type: 'PowerTo',
        operator: result[1],
        left: result[0],
        right: result[2]
      }
    });
  });

  var parseUnits = lazy(function() {
    return Parsimmon.alt(
      parseUnit(tokenType.Numbers, 'Number'),
      parseUnit(tokenType.Strings, 'String'),
      parseUnit(tokenType.Identifier, 'Identifier'),
      parseNot,
      parseNewValue,
      parseFunctions)
  });

  function parseUnit(tokenType, returnType) {
    return Parsimmon.custom(function(success, failure) {
      return function(stream, i) {
        if(matchTypeToken(stream[i],tokenType)) {
          return success(i+1,
            {
              type: returnType,
              value: stream[i].value
            });
        }
        return failure(i, 'expected ' + returnType);
      }
    });
  }

  var parseNot = lazy(function() {
    return Parsimmon.seq(parseNotAux,parseUnits).map(function(result) {
      return {
        type: result[0],
        value: result[1]
      };
    })
  });

  var parseNotAux = Parsimmon.custom(function(success, failure) {
    return function(stream, i) {
      if(matchValueToken(stream[i],'NOT')) {
        return success(i+1, 'Not');
      }
      return failure(i, 'expected NOT');
    }
  });

  var parseNewValue = lazy(function() {
    return Parsimmon.seq(parseParenthesisBegin,parseValue,parseParenthesisEnd).map(function(result) {
      return result[1];
    })
  });

  var parseParenthesisBegin = parseValueToken('(');

  var parseParenthesisEnd = parseValueToken(')');

  var parseComa = parseValueToken(',');

  var parseFunctions = lazy(function() {
    return Parsimmon.alt(
      parseFuntion1('ABS'),
      parseFuntion1('ASC'),
      parseFuntion1('ATN'),
      parseFuntion1('COS'),
      parseFuntion1('EXP'),
      parseFuntion1('INT'),
      parseFuntion1('LOG'),
      parseFuntion1('RND'),
      parseFuntion1('SGN'),
      parseFuntion1('SIN'),
      parseFuntion1('SQR'),
      parseFuntion1('TAN'),
      parseFuntion1('PEEK'),
      parseFuntion1('LEN'),
      parseFuntion1('CHR$'),
      parseFuntion1('STR$'),
      parseFuntion1('VAL'),
      parseFuntion1('FRE'),
      parseFuntion1('PDL'),
      parseFuntion1('POS'),
      parseFuntion1('USR'),
      parseFuntion2('LEFT$'),
      parseFuntion2('RIGHT$'),
      parseFuntion2('SCRN'),
      parseFuntion2('HSCRN'),
      parseFuntion3('MID$'),
      parseFunctionFN)
  });

  function parseFuntion1(functionName) {
    return Parsimmon.seq(parseFunction(functionName), parseParenthesisBegin, parseValue, parseParenthesisEnd).map(function(result) {
      return {
        type: result[0],
        value: result[2]
      };
    });
  }

  function parseFuntion2(functionName) {
    return Parsimmon.seq(parseFunction(functionName), parseParenthesisBegin, parseValue, parseComa, parseValue, parseParenthesisEnd).map(function(result) {
      return {
        type: result[0],
        param1: result[2],
        param2: result[4]
      };
    });
  }

  function parseFuntion3(functionName) {
    return Parsimmon.seq(parseFunction(functionName), parseParenthesisBegin, parseValue, parseComa, parseValue, parseComa, parseValue, parseParenthesisEnd).map(function(result) {
      return {
        type: result[0],
        param1: result[2],
        param2: result[4],
        param3: result[6]
      };
    });
  }

  var parseFunctionFN = Parsimmon.seq(
    parseFunction('FN'),
    parseUnit(tokenType.Identifier, 'Identifier'),
    parseParenthesisBegin,
    parseValue,
    parseParenthesisEnd).map(function(result) {
      return {
        type: result[0],
        name: result[1],
        value: result[3]
      };
  });








  var parseExp = Parsimmon.seq(parseLineNumber, parseValue);

  parser.parseExpr = function(exp) {
    console.log(parseExp.parse(exp));
  }


  return parser;

}());