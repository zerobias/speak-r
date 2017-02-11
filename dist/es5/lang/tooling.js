'use strict';

var R = require('ramda');

var util = require('../util');
var P = util.P;

var syntax = require('./syntax');
var types = syntax.types;
var op = syntax.op;

var checkToken = function checkToken(type) {
  return function (val) {
    return R.whereEq({ type: type, value: val });
  };
};
var checkOper = checkToken(types.op);
var checkType = R.propEq('type');

var def = function def(func, obj) {
  return function (prop) {
    return Object.defineProperty(obj, prop[0], {
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