'use strict';

var R = require('ramda');

var def = function def(func, obj) {
  return function (prop) {
    return Object.defineProperty(obj, prop[0], {
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
  // Doesnt understand wtf is going on here, but seem like this check never fall

  // const inputCheck = (argsArr,_store)=>
  //   !R.isEmpty(argsArr)
  //   &&!R.is(Function,argsArr[0])&&
  //   R.none(R.isNil,argsArr)
  //   &&!R.isEmpty(_store)
  return function ins() {
    // if (inputCheck(val,store)) {
    store.push(store.pop().apply(undefined, arguments));
    // }
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