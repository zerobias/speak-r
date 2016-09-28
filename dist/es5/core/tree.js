'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var R = require('ramda');

var util = require('../util');
var S = util.S;

var P = util.P;
var RP = util.RP;
var log = util.log('tree');
var pipelog = util.pipelog('tree');
var prop = util.prop;

var Lexeme = require('../model/lexeme');
var HeadList = require('../model/head-list');

var types = require('../lang/syntax').types;
var tool = require('../lang/tooling');
var eq = tool.equals;
var Print = require('../print');

var tapArr = function tapArr(tag) {
  return R.tap(function (e) {
    return e.map(function (o, i) {
      return pipelog(tag + ' ' + i)(o);
    });
  });
};
// const example = "tokens :: Array prop 'type' indexOf _ 'tokens' equals -1 not"
// const exampleNoDef = "prop 'type' indexOf _ 'tokens' equals -1 not"
//const onChecking = P(  R.prepend(  R.take(2) , R.equals('|>') ) , R.apply(R.ifElse) )
//const __tranducer = P(R.ifElse(P(R.prop('value'),R.propEq('type','R')),P(R.prop('value'),R.of,R.append)),R.map)
// const exampleTrans = "ifElse <| prop 'value' propEq 'type' 'R' <|> prop 'value' of append |> map" // _ identity

// const isTokenCat = tokenArray=>P(prop.type,util.isContainOrEq(tokenArray))

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
    return P(util.arrayify, R.append(e.value));
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
    return R.when(P(prop.head, cond), action);
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
  var treePipe = P(indexation, tapArr('indexation'), addArgName, tapArr('argName'), eitherToMaybe, lexemize, //tapArr('lexemize'),
  intoPipes);
  var setTree = P(stageHeader, function (e) {
    return R.assoc('tree', treePipe(e.data), e);
  });
  return setTree(data);
}

module.exports = getSyntaxTree;