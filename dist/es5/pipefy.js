'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var R = require('ramda');

var red = function red(func) {
  return R.reduce(func, []);
};
var reducer = red(logic);
var ifArr = R.pipe(R.flatten, reducer, R.flip(R.concat));
function logic(acc, val) {
  if (R.is(Array)(val)) return ifArr(val)(acc);else return R.append(val, acc);
}
function P() {
  for (var _len = arguments.length, data = Array(_len), _key = 0; _key < _len; _key++) {
    data[_key] = arguments[_key];
  }

  var actionList = reducer(data);
  return R.pipe.apply(R, _toConsumableArray(actionList));
}

module.exports = P;