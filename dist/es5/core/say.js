'use strict';

var R = require('ramda');
var HeadList = require('../model/head-list');
var Lexeme = require('../model/lexeme');
var util = require('../util');
var P = util.P;
var pipelog = util.pipelog('tree');
var Outfall = require('../model/outfall');
var eq = require('../lang/tooling').equals;

var Context = require('./context');

function CompileException(obj) {
  this.message = 'Can not compile object ' + obj;
  this.name = "Compile exeption";
}

function collectData(obj) {
  var collect = R.cond([[R.is(Array), sayPipe], [Lexeme.its.pipe, sayPipe],

  // [eq.type.arg,P(pipelog('arg'),R.prop('pipe'))],
  [Lexeme.its.atomic, sayAtomic], [P(HeadList.isList, R.not), util.prop.val], [R.T, function (e) {
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
}), R.when(util.isof.Empty, R.append({ type: 'fakeContext', value: 'data' })), R.map(util.prop.val));

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