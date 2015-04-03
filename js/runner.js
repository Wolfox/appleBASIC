this.runner = (function() {

  run = {};

  function matchValueToken(token, value) {
    return (token !== undefined && token.value === value);
  }

  function matchTypeToken(token, type) {
    return (token !== undefined && token.type === type);
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

  run.clearAll = function() {
    clearVariables();
    clearFunctions();
  }

  run.run = function(tree) {

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
        case 'HLIN': // Plot horizontal line (x1, x2 at y)
        case 'VLIN': // Plot vertical line (x1, x2 at y)
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
        case 'DRAW': // NOT IMPLEMENTED - Draw hires shape table shape in color
        case 'XDRAW': // NOT IMPLEMENTED - Draw hires shape table shape with XOR
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
      if(param.length === 0) {
        basic.addOutput('\n');
      } else {
        var value = runType(param.shift());
        basic.addOutput((value.value).toString());
        runPrint(param);
      }
    }

    function findIndexonTree(lineSearch) {
      return findIndexOnTreeAux(0,lineSearch);
    }

    function findIndexOnTreeAux(index,lineSearch) {
      if(!(index < tree.length)) {
        return undefined;
      }
      if(tree[index].lineNumber === lineSearch) {
        return index;
      }
      return findIndexOnTreeAux(index+1, lineSearch);
    }

    function runGoTo(exp) {
      var result = undefined;

      if(exp.value < 0 || ((exp.value)%1) !== 0) {
        throw 'expected lineNumber, in line ' + runLinNum;
      }

      result = findIndexonTree(exp.value);

      if(result === undefined) {
        throw 'line number not defined, in line ' + runLinNum;
      }
      GoToFLAG = result;
    }

    function runGoSub(exp) {
      var result = undefined;

      if(exp.value < 0 || ((exp.value)%1) !== 0) {
        throw 'expected lineNumber, in line ' + runLinNum;
      }

      result = findIndexonTree(exp.value);

      if(result === undefined) {
        throw 'line number not defined, in line ' + runLinNum;
      }
      GoSubFLAG.push(indexI);
      GoToFLAG = result;
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
      basic.clearOutput();
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

      return {
        type: 'String',
        value: runMidAux(0,str,start,end,"")
      };
    }

    function runMidAux(i,str,start,end,result) {
      if(!(i < ((str.value).length-start.value+1) && i < end.value)) {
        return result;
      }
      var j = i + start.value;
      if(j > 0){
        result += (str.value)[j-1];
      }
      return runMidAux(i+1,str,start,end,result);
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

    function runTree(index) {
      if(!(index < tree.length)) {
        return;
      }
      indexI = index;
      runLinNum = tree[index].lineNumber;
      if(TraceFLAG) {
        basic.addOutput('#' + runLinNum + ' ');
      }
      runStatement(tree[index].statement);
      if(GoToFLAG !== undefined) {
        index = GoToFLAG-1;
        GoToFLAG = undefined;
      }

      if ( EndFLAG || InputFLAG !== undefined) {
        return;
      }
      runTree(index+1);
    }

    runTree(0);
  }

  return run;

}());