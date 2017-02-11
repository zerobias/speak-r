'use strict';

var R = require('ramda');

var util = require('../util');
var S = util.S;

var P = util.P;
var log = util.log('tree');
var pipelog = util.pipelog('tree');

var HeadList = require('../model/head-list');
var Lexeme = require('../model/lexeme');

var tool = require('../lang/tooling');

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
  return R.both(Lexeme.its.expr, P(util.prop.head, opVal));
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

var switches = [[NaN, 1, 1, NaN, 1], // empty
[NaN, 0, 1, NaN, 0], // pipe
[NaN, -1, 1, 0, -1], // open
[NaN, -1, 1, 0, -1], // mid
[NaN, 0, 1, NaN, 0] // close
];
function optimise(data) {
  var exprToPipe = R.when(Lexeme.its.expr, P(util.prop.tail, function (e) {
    return new HeadList(e);
  }, Lexeme.Pipe));
  var singlePipeToAtomic = R.when(R.both(Lexeme.its.pipe, P(HeadList.hasTail, R.not)), util.prop.head);
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