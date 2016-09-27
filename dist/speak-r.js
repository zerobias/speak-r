(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('ramda'), require('babel-runtime/core-js/map'), require('babel-runtime/helpers/toConsumableArray'), require('debug'), require('babel-runtime/core-js/object/define-property'), require('babel-runtime/helpers/classCallCheck'), require('babel-runtime/helpers/createClass'), require('sanctuary'), require('babel-runtime/regenerator'), require('babel-runtime/core-js/get-iterator'), require('babel-runtime/core-js/symbol/iterator'), require('babel-runtime/core-js/object/create')) :
	typeof define === 'function' && define.amd ? define(['ramda', 'babel-runtime/core-js/map', 'babel-runtime/helpers/toConsumableArray', 'debug', 'babel-runtime/core-js/object/define-property', 'babel-runtime/helpers/classCallCheck', 'babel-runtime/helpers/createClass', 'sanctuary', 'babel-runtime/regenerator', 'babel-runtime/core-js/get-iterator', 'babel-runtime/core-js/symbol/iterator', 'babel-runtime/core-js/object/create'], factory) :
	(factory(global.R,global._Map,global._toConsumableArray,global.debug,global._Object$defineProperty,global._classCallCheck,global._createClass,global.sanctuary,global._regeneratorRuntime,global._getIterator,global._Symbol$iterator,global._Object$create));
}(this, (function (require$$0,_Map,_toConsumableArray,debug,_Object$defineProperty,_classCallCheck,_createClass,sanctuary,_regeneratorRuntime,_getIterator,_Symbol$iterator,_Object$create) { 'use strict';

require$$0 = 'default' in require$$0 ? require$$0['default'] : require$$0;
_Map = 'default' in _Map ? _Map['default'] : _Map;
_toConsumableArray = 'default' in _toConsumableArray ? _toConsumableArray['default'] : _toConsumableArray;
debug = 'default' in debug ? debug['default'] : debug;
_Object$defineProperty = 'default' in _Object$defineProperty ? _Object$defineProperty['default'] : _Object$defineProperty;
_classCallCheck = 'default' in _classCallCheck ? _classCallCheck['default'] : _classCallCheck;
_createClass = 'default' in _createClass ? _createClass['default'] : _createClass;
sanctuary = 'default' in sanctuary ? sanctuary['default'] : sanctuary;
_regeneratorRuntime = 'default' in _regeneratorRuntime ? _regeneratorRuntime['default'] : _regeneratorRuntime;
_getIterator = 'default' in _getIterator ? _getIterator['default'] : _getIterator;
_Symbol$iterator = 'default' in _Symbol$iterator ? _Symbol$iterator['default'] : _Symbol$iterator;
_Object$create = 'default' in _Object$create ? _Object$create['default'] : _Object$create;

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var syntax = createCommonjsModule(function (module) {
  var op = {
    doubledots: '::',
    comma: ',',
    dash: '_',
    arrow: '->',
    doublearrow: '=>',
    middlepipe: '<|>',
    backpipe: '<|',
    forwardpipe: '|>',
    equals: '==',
    plus: '+',
    minus: '-',
    map: '[^]',
    define: ':='
  };
  var types = {
    type: 'type',
    R: 'R',
    string: 'string',
    number: 'number',
    op: 'operator',
    any: 'any',
    context: 'context',
    lex: 'lexeme',
    F: 'contextF',
    arg: 'argument'
  };
  var jstypes = [['Array', Array], ['Number', Number], ['String', String], ['Function', Function], ['Object', Object], ['Null', null], ['RegExp', RegExp]];
  var quotes = ['"', "'", '`'];
  var categories = {
    piped: [types.R, types.context, types.lex],
    inserted: [types.number, types.string, types.type, types.any],
    control: [types.op]
  };
  var lexemeTypes = {
    pipe: 'Pipe',
    context: 'Context',
    atomic: 'AtomicFunc',
    expr: 'Expression',
    arg: 'Argument'
  };
  module.exports = { op: op, types: types, quotes: quotes, categories: categories, jstypes: jstypes, lexemeTypes: lexemeTypes };
});

var token = createCommonjsModule(function (module) {
  var R = require$$0;
  var types = syntax.types;
  var TokenFabric = R.curry(function (category, obj) {
    return {
      type: category,
      value: obj
    };
  });
  module.exports = R.map(function (e) {
    return TokenFabric(types[e]);
  }, {
    Type: 'type',
    R: 'R',
    String: 'string',
    Number: 'number',
    Operator: 'op',
    Any: 'any',
    Context: 'context',
    Arg: 'arg'
  });
});

var ramdaPiped = createCommonjsModule(function (module) {
  var R = require$$0;
  var def = function def(func, obj) {
    return function (prop) {
      return _Object$defineProperty(obj, prop[0], {
        get: function get() {
          func(prop[1]);
          return obj;
        } });
    };
  };
  var appender = function appender(_store) {
    return function (val) {
      return _store.push(val);
    };
  };
  var setter = function setter(store, ins, dict) {
    return R.pipe(R.toPairs, R.forEach(def(appender(store), ins)))(dict);
  };
  function polymorph(store) {
    return function ins() {
      store.push(store.pop().apply(undefined, arguments));
      return ins;
    };
  }
  function storage(dict) {
    var store = [];
    var ins = polymorph(store);
    Object.defineProperty(ins, 'store', { get: function get() {
        return store;
      } });
    Object.defineProperty(ins, 'run', { get: function get() {
        return R.pipe.apply(R, store);
      } });
    setter(store, ins, dict);
    return ins;
  }
  var RP = {};
  Object.defineProperty(RP, 'do', { get: function get() {
      return storage(R);
    } });
  module.exports = function () {
    return RP.do;
  };
});

var pipefy = createCommonjsModule(function (module) {
  var R = require$$0;

  var Red = function () {
    _createClass(Red, null, [{
      key: 'add',
      value: function add(acc, val) {
        return R.append(val, acc);
      }
    }, {
      key: 'forget',
      value: function forget(acc) {
        return acc;
      }
    }]);

    function Red(reducer) {
      var acc = arguments.length <= 1 || arguments[1] === undefined ? Red.add : arguments[1];

      _classCallCheck(this, Red);

      return R.transduce(reducer, acc, []);
    }

    _createClass(Red, null, [{
      key: 'ucer',
      value: function ucer() {
        return new Red(R.compose.apply(R, arguments));
      }
    }]);

    return Red;
  }();

  var _filter = R.compose(R.flatten, R.map(R.when(R.is(Array), R.map(_P))), R.filter(R.is(Function)));
  var tr = new Red();
  var accum = R.ifElse(R.is(Array), R.flip(R.concat), Red.add);
  function _P() {
    for (var _len = arguments.length, pipes = Array(_len), _key = 0; _key < _len; _key++) {
      pipes[_key] = arguments[_key];
    }

    var filtered = _filter(pipes);
    return R.pipe.apply(R, _toConsumableArray(filtered));
  }
  var filtP = R.either(R.is(Array), R.is(Function));
  var P = new Red(R.filter(filtP), R.check);
  function _P2(pipe1, pipe2, data) {
    return pipe2(pipe1(data));
  }
  var P2 = R.curry(_P2);
  Object.defineProperty(_P, 'P2', { value: P2 });
  Object.defineProperty(_P, 'Red', { value: Red });
  Object.defineProperty(_P, 'toPipe', { value: function value(funcs) {
      return R.pipe.apply(R, _toConsumableArray(funcs));
    } });
  module.exports = _P;
});

var util = createCommonjsModule(function (module) {
  var R = require$$0;
  var debug$$1 = debug;
  var RP = ramdaPiped;
  var pipefy$$1 = pipefy;
  var P = pipefy$$1;
  var isof = {
    String: R.is(String),
    Func: R.is(Function),
    Array: R.is(Array),
    Nil: R.isNil,
    Real: function Real(e) {
      return !R.isNil(e);
    },
    Empty: R.isEmpty,
    Full: function Full(e) {
      return !R.isEmpty(e);
    }
  };
  var tagvalue = function tagvalue(tag, mess) {
    return isof.Nil(mess) ? tag : [tag, mess].join(':  ');
  };
  var log = function log(tag) {
    return function (mess) {
      return debug$$1(tagvalue(tag, mess));
    };
  };
  var pipelog = function pipelog(tag) {
    return function (mess) {
      return R.tap(log(tag)(mess));
    };
  };
  var arrayify = R.pipe(R.defaultTo([]), R.unless(isof.Array, R.of));
  var isContainOrEq = P(arrayify, R.flip(R.contains));
  var create = sanctuary.create;
  var env = sanctuary.env;

  var checkTypes = false;
  var S = create({ checkTypes: checkTypes, env: env });
  var prop = R.map(R.prop, {
    type: 'type',
    val: 'value',
    head: 'head',
    tail: 'tail',
    data: 'data'
  });
  var isString = isof.String;
  module.exports = {
    pipelog: pipelog, log: log, isString: isString, arrayify: arrayify, P: P, isof: isof, isContainOrEq: isContainOrEq, prop: prop, RP: RP, S: S
  };
});

var fabric = createCommonjsModule(function (module) {
  var R = require$$0;
  var syntax$$1 = syntax;
  var Token = token;
  var util$$1 = util;
  var S = util$$1.S;
  var P = util$$1.P;
  var isString = util$$1.isString;
  function TokenFabric(tokenType, condition, transformation) {
    var onCondition = P(util$$1.arrayify, R.allPass, S.either(R.__, R.F));
    var appendArray = R.flip(R.concat);
    var addSteps = appendArray([tokenType, S.Right]);
    var transformUntouched = P(util$$1.arrayify, addSteps, function (e) {
      return util$$1.P.apply(util$$1, _toConsumableArray(e));
    }, function (e) {
      return S.either(e, R.identity);
    });
    return R.when(onCondition(condition), transformUntouched(transformation));
  }
  var quoteProcessor = function quoteProcessor() {
    var isQuote = R.anyPass(R.map(R.equals, syntax$$1.quotes));
    var isQuoted = R.allPass([P(R.head, isQuote), P(R.last, isQuote)]);
    var removeQuotes = P(R.init, R.tail);
    return TokenFabric(Token.String, [isString, isQuoted], [R.trim, removeQuotes]);
  };
  var typesProcessor = function typesProcessor() {
    var types = new _Map(syntax$$1.jstypes);
    var isInMap = function isInMap(obj) {
      return isString(obj) ? types.has(obj) : false;
    };
    return TokenFabric(Token.Type, isInMap, function (e) {
      return types.get(e);
    });
  };
  var isNumber = TokenFabric(Token.Number, isFinite, parseFloat);
  var vendorProcessor = function vendorProcessor() {
    var isFunc = R.is(Function);
    var isRamda = function isRamda(obj) {
      return isFunc(R[obj]);
    };
    return TokenFabric(Token.R, [isString, isRamda], R.prop(R.__, R));
  };
  var contextValidation = function contextValidation(str) {
    return P(R.match(/\D\w+/), R.head, R.equals(str))(str);
  };
  var isContext = TokenFabric(Token.Context, contextValidation);
  var argValidation = R.both(P(R.head, R.equals('@')), P(R.tail, contextValidation));
  var isArg = TokenFabric(Token.Arg, argValidation, R.tail);
  var preprocess = S.lift(R.when(isString, R.trim));
  var postprocess = R.identity;
  module.exports = {
    isQuote: quoteProcessor(),
    isType: typesProcessor(),
    isVendor: vendorProcessor(),
    isNumber: isNumber,
    isContext: isContext,
    isArg: isArg,
    preprocess: preprocess,
    postprocess: postprocess
  };
});

var splitter = createCommonjsModule(function (module) {
  var R = require$$0;
  var util$$1 = util;
  var P = util$$1.P;
  var Token = token;
  var log = util$$1.pipelog('splitter');
  var operators = R.values(syntax.op);
  var toPipe = P.toPipe;
  var stringMorpher = function stringMorpher(morph) {
    return R.map(R.when(util$$1.isof.String, morph));
  };
  var stringTrim = stringMorpher(R.trim);
  var rejectEmpty = R.reject(R.isEmpty);
  var opersFuncs = [R.split, P(Token.Operator, R.intersperse)];
  var constFuncs = [rejectEmpty, R.unnest];
  var splitCond = function splitCond(symb) {
    return R.cond([[util$$1.isof.String, symb], [R.T, log('uncaught')]]);
  };
  var unnester = function unnester(symbPipe) {
    return P(symbPipe, R.unnest);
  };
  var splitsPipe = [R.of, R.ap(opersFuncs), R.concat(R.__, constFuncs), toPipe, splitCond, R.map, unnester, log('splitPipe')];
  var splitter = P(toPipe, R.map(R.__, operators), toPipe)(splitsPipe);
  var cleaner = P(R.unnest, stringTrim, rejectEmpty, log('end'));
  var execFuncs = [util$$1.arrayify, splitter, cleaner];
  var exec = toPipe(execFuncs);
  module.exports = { exec: exec, cleaner: cleaner };
});

var stringPreprocess = createCommonjsModule(function (module) {
  var R = require$$0;
  var fab = fabric;
  var splitter$$1 = splitter;
  var util$$1 = util;
  var S = util$$1.S;
  var pipelog = util$$1.pipelog('preproc');
  var singleWordParsing = R.pipe(fab.preprocess, pipelog('->isQuote'), fab.isQuote, pipelog('->isNumber'), fab.isNumber, pipelog('->isType'), fab.isType, pipelog('->isVendor'), fab.isVendor, pipelog('->isArg'), fab.isArg, pipelog('->isContext'), fab.isContext, pipelog('->postprocess'), fab.postprocess);
  function splitKeywords(data) {
    var err = R.unless(util$$1.isString, function () {
      throw new Error('`keywords` should be String');
    });
    var beforeSplit = R.pipe(err, R.split(' '), R.reject(R.isEmpty));
    var sSort = R.map(R.ifElse(R.is(Object), S.Right, S.Left));
    var _drops = function _drops(a, b) {
      return R.allPass([R.propEq('type', 'operator'), R.propEq('obj', ','), R.eqProps('obj', R.__, b)])(a);
    };
    var drops = R.dropRepeatsWith(_drops);
    var un = R.unary(R.pipe(beforeSplit, splitter$$1.exec, sSort, pipelog('тэг'), R.map(singleWordParsing), drops));
    fab;
    return un(data);
  }
  module.exports = splitKeywords;
});

var lexeme = createCommonjsModule(function (module) {
  var R = require$$0;
  var lexemeTypes = syntax.lexemeTypes;

  var ILexeme = function ILexeme(typename, obj) {
    _classCallCheck(this, ILexeme);

    obj.index = obj.head.index;
    obj.lexeme = typename;
    return obj;
  };

  var Lexeme = function () {
    function Lexeme() {
      _classCallCheck(this, Lexeme);
    }

    _createClass(Lexeme, null, [{
      key: 'Pipe',
      value: function Pipe(tokensHList) {
        return new ILexeme(lexemeTypes.pipe, tokensHList);
      }
    }, {
      key: 'AtomicFunc',
      value: function AtomicFunc(tokensHList) {
        return new ILexeme(lexemeTypes.atomic, tokensHList);
      }
    }, {
      key: 'Expression',
      value: function Expression(tokensHList) {
        return new ILexeme(lexemeTypes.expr, tokensHList);
      }
    }, {
      key: 'Argument',
      value: function Argument(tokensHList) {
        return new ILexeme(lexemeTypes.arg, tokensHList);
      }
    }, {
      key: 'Context',
      value: function Context(token) {
        return new Lexeme(lexemeTypes.context, token);
      }
    }, {
      key: 'its',
      get: function get() {
        var eq = R.propEq('lexeme');
        return R.map(eq, lexemeTypes);
      }
    }]);

    return Lexeme;
  }();

  module.exports = Lexeme;
});

var headList$1 = createCommonjsModule(function (module) {
  var R = require$$0;
  var util$$1 = util;
  var S = util$$1.S;
  var P = util$$1.P;

  var HeadList = function () {
    function HeadList(rawList, head) {
      _classCallCheck(this, HeadList);

      if (!R.is(Array, rawList) || R.isEmpty(rawList)) return S.Left('No array recieved');
      if (R.isNil(head)) {
        this.head = R.head(rawList);
        this.tail = R.tail(rawList);
      } else {
        this.head = head;
        this.tail = rawList || [];
      }
      this[_Symbol$iterator] = _regeneratorRuntime.mark(function _callee() {
        var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, e;

        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.head;

              case 2:
                _iteratorNormalCompletion = true;
                _didIteratorError = false;
                _iteratorError = undefined;
                _context.prev = 5;
                _iterator = _getIterator(this.tail);

              case 7:
                if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                  _context.next = 14;
                  break;
                }

                e = _step.value;
                _context.next = 11;
                return e;

              case 11:
                _iteratorNormalCompletion = true;
                _context.next = 7;
                break;

              case 14:
                _context.next = 20;
                break;

              case 16:
                _context.prev = 16;
                _context.t0 = _context['catch'](5);
                _didIteratorError = true;
                _iteratorError = _context.t0;

              case 20:
                _context.prev = 20;
                _context.prev = 21;

                if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
                }

              case 23:
                _context.prev = 23;

                if (!_didIteratorError) {
                  _context.next = 26;
                  break;
                }

                throw _iteratorError;

              case 26:
                return _context.finish(23);

              case 27:
                return _context.finish(20);

              case 28:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[5, 16, 20, 28], [21,, 23, 27]]);
      });
    }

    _createClass(HeadList, [{
      key: 'append',
      value: function append(e) {
        if (R.isEmpty(this.tail) && R.isEmpty(this.head)) this.head = e;else this.tail.push(e);
        return this;
      }
    }, {
      key: 'toArray',
      get: function get() {
        return R.prepend(this.head, this.tail);
      }
    }, {
      key: 'length',
      get: function get() {
        return R.defaultTo(0, this.tail.length) + R.isEmpty(this.head) ? 0 : 1;
      }
    }], [{
      key: 'cyclic',
      value: function cyclic(func) {
        return function (list) {
          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = _getIterator(list), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var e = _step2.value;

              e = P(R.when(HeadList.isList, HeadList.cyclic(func)), func)(e);
            }
          } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
              }
            } finally {
              if (_didIteratorError2) {
                throw _iteratorError2;
              }
            }
          }

          return list;
        };
      }
    }, {
      key: 'hasTail',
      value: function hasTail(list) {
        return R.has('tail', list) && !R.isEmpty(list.tail);
      }
    }, {
      key: 'last',
      value: function last(list) {
        return HeadList.hasTail(list) ? R.last(list.tail) : list.head;
      }
    }, {
      key: 'lastR',
      value: function lastR(list) {
        var isStrict = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

        var _hasTail = R.has('tail');
        var notHas = P(_hasTail, R.not);
        var cond = R.either(notHas, P(HeadList.last, notHas));
        return R.until(isStrict ? cond : notHas, HeadList.last)(list);
      }
    }, {
      key: 'emptyList',
      value: function emptyList() {
        return new HeadList([{}]);
      }
    }, {
      key: 'isList',
      value: function isList(list) {
        return R.has('head', list);
      }
    }, {
      key: 'prepend',
      get: function get() {
        return R.curry(function (val, list) {
          list.tail = R.prepend(list.head, list.tail);
          list.head = val;
          return list;
        });
      }
    }]);

    return HeadList;
  }();

  module.exports = HeadList;
});

var tooling = createCommonjsModule(function (module) {
  var R = require$$0;
  var util$$1 = util;
  var P = util$$1.P;
  var syntax$$1 = syntax;
  var types = syntax$$1.types;
  var op = syntax$$1.op;
  var checkToken = function checkToken(type) {
    return function (val) {
      return R.whereEq({ type: type, value: val });
    };
  };
  var checkOper = checkToken(types.op);
  var checkType = R.propEq('type');
  var def = function def(func, obj) {
    return function (prop) {
      return _Object$defineProperty(obj, prop[0], {
        get: function get() {
          func(prop[1]);
          return obj;
        } });
    };
  };
  function polymorph(store) {
    return function ins(val) {
      return R.ifElse(R.either(R.isNil, function () {
        return R.isEmpty(store);
      }), function () {
        return ins;
      }, R.anyPass(store))(val);
    };
  }
  var appender = function appender(store) {
    return function (val) {
      return store.push(val);
    };
  };
  var setter = function setter(store, ins, dict) {
    return P(R.toPairs, R.forEach(def(appender(store), ins)))(dict);
  };
  function storage(dict) {
    var store = [];
    var ins = polymorph(store);
    Object.defineProperty(ins, 'store', { get: function get() {
        return store;
      } });
    setter(store, ins, dict);
    return ins;
  }
  var eq = {
    op: R.map(checkOper)(op),
    type: R.map(checkType)(types),
    typedVal: R.map(checkToken)(types)
  };
  var equals = {};
  Object.defineProperty(equals, 'op', { get: function get() {
      return storage(eq.op);
    } });
  Object.defineProperty(equals, 'type', { get: function get() {
      return storage(eq.type);
    } });
  Object.defineProperty(equals, 'typedVal', { get: function get() {
      return storage(eq.typedVal);
    } });
  module.exports = { eq: eq, equals: equals };
});

var print = createCommonjsModule(function (module) {
  var R = require$$0;
  var util$$1 = util;
  var S = util$$1.S;
  var P = util$$1.P;
  var log = util$$1.log('tree');
  var HeadList = headList$1;

  var Print = function () {
    function Print() {
      _classCallCheck(this, Print);
    }

    _createClass(Print, null, [{
      key: '_indexTag',
      value: function _indexTag(tag) {
        return function (e) {
          var separ = arguments.length <= 1 || arguments[1] === undefined ? ' ' : arguments[1];
          return P(util$$1.arrayify, R.prepend(tag), R.join(separ), log)(e);
        };
      }
    }, {
      key: 'arr',
      value: function arr(tag, _arr) {
        var iTag = Print._indexTag(tag);
        return _arr.forEach(function (e, i) {
          return iTag(i)(e);
        });
      }
    }, {
      key: 'to',
      value: function to(func) {
        return P(S.maybeToNullable, func);
      }
    }, {
      key: 'headList',
      value: function headList(tag, data) {
        var index = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
        var level = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];

        var iTag = Print._indexTag(tag);
        var padd = '   ';
        var joinPadd = P(R.repeat(padd), R.join(''));
        var objKeys = ['value'];
        var keyValPrint = function keyValPrint(padding) {
          return function (e) {
            return iTag(['  ', joinPadd(level), padding, e[0]], '')(e[1]);
          };
        };
        var tokenPrint = function tokenPrint(keys) {
          return P(R.props(keys), R.zip(keys), R.forEach(keyValPrint(padd)));
        };
        var isRealIndex = function isRealIndex(i) {
          return i === -1 ? '#  ' : i + 1 + (i + 1 >= 10 ? ' ' : '  ');
        };
        var nextLevel = R.add(2, level);
        if (HeadList.isList(data)) {
          keyValPrint(isRealIndex(index))([data.lexeme, data.index]);
          Print.headList(tag, data.head, -1, nextLevel);
          if (HeadList.hasTail(data)) data.tail.forEach(function (e, i) {
            return Print.headList(tag, e, i, nextLevel);
          });
        } else {
          keyValPrint(isRealIndex(index))([data.type, data.index]);
          tokenPrint(objKeys)(data);
        }
      }
    }, {
      key: 'funcReplace',
      get: function get() {
        return R.when(P(R.last, R.is(Function)), function (e) {
          return [e[0], 'FUNC'];
        });
      }
    }, {
      key: 'pair',
      get: function get() {
        return P(R.toPairs, R.map(Print.funcReplace()));
      }
    }]);

    return Print;
  }();

  module.exports = Print;
});

var tree = createCommonjsModule(function (module) {
  var R = require$$0;
  var util$$1 = util;
  var S = util$$1.S;
  var P = util$$1.P;
  var RP = util$$1.RP;
  var log = util$$1.log('tree');
  var pipelog = util$$1.pipelog('tree');
  var prop = util$$1.prop;
  var Lexeme = lexeme;
  var HeadList = headList$1;
  var types = syntax.types;
  var tool = tooling;
  var eq = tool.equals;
  var Print = print;
  var tapArr = function tapArr(tag) {
    return R.tap(function (e) {
      return e.map(function (o, i) {
        return pipelog(tag + ' ' + i)(o);
      });
    });
  };
  var eitherToMaybe = R.map(S.eitherToMaybe);
  function indexation(data) {
    var indexPipe = function indexPipe(e, i) {
      return S.lift(R.assoc('index', i))(e);
    };
    var _indexation = function _indexation(list) {
      return list.map(indexPipe);
    };
    return _indexation(data);
  }
  var valEq = R.propEq('value');
  var check = function check(func) {
    return function (e) {
      return R.both(S.isRight, valEq(true))(S.lift(func, e));
    };
  };
  function stageHeader(data) {
    var eiSplitOn = function eiSplitOn(func) {
      return P(R.splitWhen(check(func)), R.adjust(R.tail, 1));
    };
    var split = {
      context: eiSplitOn(eq.op.doubledots),
      define: eiSplitOn(eq.op.define)
    };
    var writeField = function writeField(field, obj) {
      return function (res) {
        if (R.isEmpty(res[1])) {
          obj[field] = false;
          return res[0];
        } else {
          obj[field] = S.rights(res[0]);
          return res[1];
        }
      };
    };
    var props = {};
    var res = P(split.define, writeField('define', props), split.context, writeField('context', props));
    props.data = res(data);
    return props;
  }
  function headSplitter(isMaster, onMaster, changeLast) {
    var lensLast = RP().length.dec.lensIndex.run;
    var onEmpty = function onEmpty(e) {
      return R.append(Lexeme.Pipe(new HeadList([e])));
    };
    var onSlave = function onSlave(e) {
      return function (list) {
        return R.ifElse(R.isEmpty, onEmpty(e), R.over(lensLast(list), changeLast(e)))(list);
      };
    };
    var tranducer = R.map(R.ifElse(isMaster, onMaster, onSlave));
    return R.transduce(tranducer, function (acc, val) {
      return val(acc);
    });
  }
  function intoAtomics(data) {
    var changeLast = function changeLast(e) {
      return P(util$$1.arrayify, R.append(e.value));
    };
    var isMaster = P(prop.val, eq.type.R.op.context);
    var onMaster = P(prop.val, R.of, R.append);
    var tr = headSplitter(isMaster, onMaster, changeLast);
    return tr([], data);
  }
  function intoPipes(data) {
    var changeLast = function changeLast(e) {
      return function (hList) {
        return hList.append(e);
      };
    };
    var pipeSymbols = eq.op.forwardpipe.middlepipe.backpipe;
    var isMaster = R.both(HeadList.isList, P(prop.head, pipeSymbols));
    var onMaster = P(R.identity, R.append);
    var tr = headSplitter(isMaster, onMaster, changeLast);
    return tr([], data);
  }
  function checkReplace(data) {
    var replacers = [[eq.op.dash, types.any, R.__], [eq.op.equals, types.R, R.equals], [eq.op.plus, types.R, R.add], [eq.op.minus, types.R, R.subtract], [eq.op.map, types.R, R.map]];
    var replacer = function replacer(type, value) {
      return function (e) {
        e.value = value;
        e.type = type;
        return e;
      };
    };
    var doCheckReplace = function doCheckReplace(checker, type, value) {
      return R.map(R.when(checker, replacer(type, value)));
    };
    var reducer = function reducer(acc, val) {
      return doCheckReplace.apply(undefined, _toConsumableArray(val))(acc);
    };
    return R.reduce(reducer, data, replacers);
  }
  var taplog = function taplog(tag) {
    return R.tap(function (e) {
      return Print.headList(tag, e, -1);
    });
  };
  function lexemize(data) {
    var whenHeadIsDo = function whenHeadIsDo(cond, action) {
      return R.when(P.P2(prop.head, cond), action);
    };
    var detectAtomic = whenHeadIsDo(eq.type.R.context, Lexeme.AtomicFunc);
    var detectExpr = whenHeadIsDo(eq.type.op, Lexeme.Expression);
    var detecting = P(function (e) {
      return new HeadList(e);
    }, detectAtomic, detectExpr, taplog('detectExpr '));
    var lexemizing = P(S.lift(checkReplace), tapArr('checkReplace'), intoAtomics, pipelog('intoAtomics'), R.map(detecting));
    return lexemizing(data);
  }
  function addArgName(data) {
    var morph = function morph(e) {
      return R.when(eq.type.arg.context, R.assoc('argName', e.value))(e);
    };
    var apply = function apply(e) {
      return S.Right(morph).ap(e);
    };
    return R.map(apply, data);
  }
  function getSyntaxTree(data) {
    var treePipe = P(indexation, tapArr('indexation'), addArgName, tapArr('argName'), eitherToMaybe, lexemize, intoPipes);
    var setTree = P(stageHeader, function (e) {
      return R.assoc('tree', treePipe(e.data), e);
    });
    return setTree(data);
  }
  module.exports = getSyntaxTree;
});

var convolve = createCommonjsModule(function (module) {
  var R = require$$0;
  var util$$1 = util;
  var S = util$$1.S;
  var P = util$$1.P;
  var log = util$$1.log('tree');
  var pipelog = util$$1.pipelog('tree');
  var HeadList = headList$1;
  var Lexeme = lexeme;
  var tool = tooling;
  var eqOp = tool.eq.op;
  var stateNames = ['pipe', 'open', 'mid', 'close'];
  var states = {
    empty: 0,
    pipe: 1,
    open: 2,
    mid: 3,
    close: 4
  };
  var actions = {
    next: 0,
    child: 1,
    parent: -1,
    error: NaN
  };
  var opCond = function opCond(opVal) {
    return R.both(Lexeme.its.expr, P(util$$1.prop.head, opVal));
  };
  var stateConds = {
    pipe: Lexeme.its.pipe,
    open: opCond(eqOp.backpipe),
    mid: opCond(eqOp.middlepipe),
    close: opCond(eqOp.forwardpipe)
  };
  var stConds = R.cond(R.append([R.T, states.pipe], R.map(function (e) {
    return [stateConds[e], function () {
      return states[e];
    }];
  }, stateNames)));
  var switches = [[NaN, 1, 1, NaN, 1], [NaN, 0, 1, NaN, 0], [NaN, -1, 1, 0, -1], [NaN, -1, 1, 0, -1], [NaN, 0, 1, NaN, 0]];
  function optimise(data) {
    var exprToPipe = R.when(Lexeme.its.expr, P(util$$1.prop.tail, function (e) {
      return new HeadList(e);
    }, Lexeme.Pipe));
    var singlePipeToAtomic = R.when(R.both(Lexeme.its.pipe, P(HeadList.hasTail, R.not)), util$$1.prop.head);
    return P(exprToPipe, singlePipeToAtomic)(data);
  }
  function Stack() {
    var _this = this;

    var appendTo = function appendTo(obj) {
      return function (e) {
        return obj.append(e);
      };
    };
    this.value = [];
    this.push = function (obj) {
      return _this.value.push(appendTo(obj));
    };
    this.pushLast = function (result) {
      return _this.push(HeadList.lastR(result, true));
    };
    this.pop = function () {
      return _this.value.pop();
    };
    this.addToLast = function (val) {
      return R.last(_this.value)(val);
    };
  }
  function convolve(dataPack) {
    var data = dataPack.tree;
    if (!R.is(Array, data)) return S.Left('No array recieved');
    var result = HeadList.emptyList();
    var stack = new Stack();
    var state = states.empty;
    var i = 0,
        len = data.length;
    while (i < len) {
      var e = data[i++];
      var nextState = stConds(e);
      var doAction = switches[state][nextState];
      switch (doAction) {
        case actions.child:
          stack.pushLast(result);
          break;
        case actions.parent:
          stack.pop();
          break;
      }
      state = nextState;
      stack.addToLast(optimise(e));
    }
    dataPack.tree = P(Lexeme.Pipe, optimise)(result);
    return dataPack;
  }
  module.exports = convolve;
});

var outfall = createCommonjsModule(function (module) {
  var util$$1 = util;
  var R = require$$0;
  var P = util$$1.P;
  var log = util$$1.pipelog('tree');
  var pipelog = util$$1.pipelog('tree');
  function Outfall() {
    this.id = Math.round(Math.random() * 10e5);
    this.updated = false;
    this._data = null;
  }
  Object.defineProperty(Outfall, 'gate', { get: function get() {
      return new Outfall();
    } });
  Object.defineProperty(Outfall.prototype, 'pipe', {
    get: function get() {
      var self = this;
      return function (data) {
        self.updated = true;
        self._data = data;
        return data[0];
      };
    }
  });
  Outfall.prototype.Spout = function (index) {
    var isArg = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

    return Spout(this, index, isArg);
  };
  function Spout(parent, index, isArg) {
    var spout = _Object$create(parent, {
      data: { get: function get() {
          return parent._data;
        }, enumerable: true },
      index: { get: function get() {
          return index;
        }, enumerable: true },
      id: { get: function get() {
          return parent.id;
        }, enumerable: true },
      isArg: { value: isArg, enumerable: true }
    });
    Object.defineProperty(spout, 'pipe', { value: function value() {
        log('spout pipe')(spout.data[spout.index], spout);
        if (R.isNil(spout.data)) return null;
        return spout.isArg ? spout.data[spout.index] : spout.data[spout.index];
      },
      enumerable: true });
    return spout;
  }
  module.exports = Outfall;
});

var context = createCommonjsModule(function (module) {
  "use strict";

  var R = require$$0;
  var util$$1 = util;
  var P = util$$1.P;
  var S = util$$1.S;
  var log = util$$1.log('tree');
  var pipelog = util$$1.pipelog('tree');
  var prop = util$$1.prop;
  var eq = tooling.equals;
  var HeadList = headList$1;
  var types = syntax.types;
  var Lexeme = lexeme;
  var chain = function chain(func) {
    return function (o) {
      return o.chain(func);
    };
  };

  var IndexMap = function () {
    _createClass(IndexMap, null, [{
      key: 'indexation',
      get: function get() {
        return R.addIndex(R.map)(function (e, i) {
          return R.pair(e.value, i);
        });
      }
    }]);

    function IndexMap(context) {
      _classCallCheck(this, IndexMap);

      var arr = IndexMap.indexation(context);
      log('index map')(arr);
      this._map = new _Map(arr);
    }

    _createClass(IndexMap, [{
      key: 'has',
      get: function get() {
        var self = this._map;
        return function (e) {
          return self.has(e);
        };
      }
    }, {
      key: 'get',
      get: function get() {
        var self = this._map;
        return function (e) {
          return self.get(e);
        };
      }
    }, {
      key: 'hasVal',
      get: function get() {
        var has = this.has;
        return P(prop.val, has);
      }
    }]);

    return IndexMap;
  }();

  function fillUserData(userData, dataPack) {
    var indexMap = new IndexMap(dataPack.context || []);
    var isArgOrCont = eq.type.arg.context;
    var morpher = HeadList.cyclic(modify);
    dataPack.tree = morpher(dataPack.tree);
    function modify(e) {
      if (!isArgOrCont(e)) return e;
      log('ee')(e, isArgOrCont(e));
      if (!indexMap.hasVal(e)) log('ERRRROR!')(e);
      var argIndex = indexMap.get(e.value);
      var getArg = userData[argIndex];
      log('refs')(e.type, argIndex, getArg);
      e.value = getArg;
      return e;
    }
    return dataPack;
  }
  module.exports = { fillUserData: fillUserData };
});

var say = createCommonjsModule(function (module) {
  var R = require$$0;
  var HeadList = headList$1;
  var Lexeme = lexeme;
  var util$$1 = util;
  var P = util$$1.P;
  var pipelog = util$$1.pipelog('tree');
  var Outfall = outfall;
  var eq = tooling.equals;
  var Context = context;
  function CompileException(obj) {
    this.message = 'Can not compile object ' + obj;
    this.name = "Compile exeption";
  }
  function collectData(obj) {
    var collect = R.cond([[R.is(Array), sayPipe], [Lexeme.its.pipe, sayPipe], [Lexeme.its.atomic, sayAtomic], [P(HeadList.isList, R.not), util$$1.prop.val], [R.T, function (e) {
      throw new CompileException(e);
    }]]);
    return collect(obj);
  }
  function sayPipe(list) {
    var normalize = R.when(HeadList.isList, R.prop('toArray'));
    return P(normalize, R.map(collectData), R.apply(R.pipe))(list);
  }
  function sayAtomic(list) {
    var applyTailToHead = function applyTailToHead() {
      return R.apply(collectData(list.head), R.map(collectData, list.tail));
    };
    return HeadList.hasTail(list) ? applyTailToHead() : collectData(list.head);
  }
  var contextArgs = P(R.when(R.equals(false), function () {
    return [];
  }), R.when(util$$1.isof.Empty, R.append({ type: 'fakeContext', value: 'data' })), R.map(util$$1.prop.val));
  function Runner(dataPack) {
    var obj = function obj() {
      for (var _len = arguments.length, userArgs = Array(_len), _key = 0; _key < _len; _key++) {
        userArgs[_key] = arguments[_key];
      }

      dataPack.gate.pipe(userArgs);
      var filled = Context.fillUserData(userArgs, dataPack);
      var render = collectData(filled.tree);
      return render.apply(undefined, userArgs);
    };
    Object.defineProperty(obj, 'data', {
      value: dataPack
    });
    Object.defineProperty(obj, 'source', { get: function get() {
        return obj.data.source;
      }
    });
    Object.defineProperty(obj, 'args', { get: function get() {
        return contextArgs(obj.data.context);
      }
    });
    return obj;
  }
  function say(sourceString) {
    return function (dataPack) {
      dataPack.source = sourceString;
      dataPack.gate = Outfall.gate;
      return new Runner(dataPack);
    };
  }
  say.sayPipe = sayPipe;
  say.collectData = collectData;
  module.exports = say;
});

var index = createCommonjsModule(function (module) {
  var R = require$$0;
  var preproc = stringPreprocess;
  var getTree = tree;
  var convolve$$1 = convolve;
  var Speak = say;
  var util$$1 = util;
  var P = util$$1.P;
  var log = util$$1.log('index');
  var pipelog = util$$1.pipelog('index');
  var Print = print;
  var taplog = function taplog(tag) {
    return R.tap(function (e) {
      return Print.headList(tag, e.tree, -1);
    });
  };
  var maptaphead = function maptaphead(tag) {
    return R.tap(P(R.prop('tree'), R.map(function (e) {
      return Print.headList(tag, e, -1);
    })));
  };
  var mapprint = function mapprint(tag) {
    return R.tap(R.map(pipelog(tag)));
  };
  function say$$1(data) {
    return P(preproc, mapprint('preproc'), getTree, maptaphead('getTree'), convolve$$1, taplog('conv'), Speak(data))(data);
  }
  var pureExample = "indexes data sright :: head prop 'index' append <| _ <|> @data |> unnest sright";
  var simple = "when <| == 1 not <|> + 10 |> + 100";
  log('example')(pureExample);
  var word = say$$1(pureExample);
  var indexes = [{ index: [1, 3] }, { index: [0, 1, 2, 3] }, 0];
  var dat = [0, 5, 20, 30, 40, 50];
  var sright = R.objOf('result');
  var res = word(indexes, dat, sright);
  log('res')(res);
  module.exports = say$$1;
});

})));
//# sourceMappingURL=speak-r.js.map
