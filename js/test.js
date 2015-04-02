this.test = (function() {

  tell = {};

  var finaltest1 = [{type: "Numbers", value: 2}, {type: "Operator", value: '+'}, {type: "Numbers", value: 2}];

  var finaltest2 = [{type: "Numbers", value: 2}, {type: "Operator", value: '*'}, {type: "Numbers", value: 2}];

  var finaltest3 = [{type: "Numbers", value: 2}];

  var finaltest6 = [{type: "LineNumber", value: 2}, {type: "Numbers", value: 2}];

  var test5 = [{type: "Operator", value: '*'}];

  var lazy = Parsimmon.lazy;

  var parseNumber = Parsimmon.custom(function(success, failure) {
    return function(stream, i) {
      if(stream[i].type === "Numbers") {
        return success(i+1,
          {
            type: 'Number',
            value: stream[i].value
          });
      }
      return failure(i, 'expected Number');
    }
  });

  var parseLineNumber = Parsimmon.custom(function(success, failure) {
    return function(stream, i) {
      if(stream[i].type === "LineNumber") {
        return success(i+1,
          {
            type: 'Number',
            value: stream[i].value
          });
      }
      return failure(i, 'expected Number');
    }
  });

  var parseMult0 = Parsimmon.custom(function(success, failure) {
    return function(stream, i) {
      if(stream[i] !== undefined && stream[i].type === "Operator" && stream[i].value === '*') {
        return success(i+1, stream[i].value);
      }
      return failure(i, 'expected Mult');
    }
  });

  var parseMult1 = lazy(function() {
    return Parsimmon.seq(parseNumber, parseMult0, parseMult).map(function(result) {
      return {
        type: 'MultDiv',
        operator: result[1],
        left: result[0],
        right: result[2]
      }
    });});

  var parseMult2 = parseNumber;

  var parseMult = Parsimmon.alt(parseMult1,parseMult2);

  var parseAdd0 = Parsimmon.custom(function(success, failure) {
    return function(stream, i) {
      if(stream[i] !== undefined && stream[i].type === "Operator" && stream[i].value === '+') {
        return success(i+1, stream[i].value);
      }
      return failure(i, 'expected Add');
    }
  });

  var parseAdd1 = lazy(function() {
    return Parsimmon.seq(parseMult, parseAdd0, parseAdd).map(function(result) {
      return {
        type: 'AddSub',
        operator: result[1],
        left: result[0],
        right: result[2]
      }
    });});

  var parseAdd2 = parseMult;

  var parseAdd = Parsimmon.alt(parseAdd1,parseAdd2);

  var parseExp = Parsimmon.seq(parseLineNumber,parseAdd);


  tell.parseExpr = function(exp) {
    console.log(parseExp.parse(finaltest6));
    console.log(parseExp.parse(exp));
  }


  tell.hello = function() {

    var string = Parsimmon.string;

    //var t = expr.parse('3').value // => 3

    var t = Parsimmon.succeed("t");

    function notChar(char) {
      return Parsimmon.custom(function(success, failure) {
        return function(stream, i) {
          if (stream.charAt(i) !== char) {
            return success(i+1, stream.charAt(i));
          }
          return failure(i, 'anything different than "' + char + '"');
        }
      });
    }

    var asdfg = lazy(function() { return Parsimmon.seq(string('a'), parsertest1);});

    var parsertest1 = Parsimmon.alt(asdfg,string('b'));

    var parser2 = string('foo').map(function(x) { return x + 'bar'; });

    var parser = Parsimmon.seq(string('a'), notChar('b'), string('a'));
    console.log(parser.parse('aca'));
    console.log(parser2.parse("foao"));
    //console.log(asdfg.parse("aaaaaab"));
    console.log(parseAdd.parse(finaltest3));
    //console.log(parseMult0.parse(test5));
    console.log(parseAdd.parse(finaltest2));
    console.log(parseAdd.parse(finaltest1));

    console.log("hey");

    return "hello world!";
  }


  return tell;

}());