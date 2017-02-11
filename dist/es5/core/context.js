'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var R = require('ramda');

var util = require('../util');
var P = util.P;
var S = util.S;
var log = util.log('tree');
var pipelog = util.pipelog('tree');
var prop = util.prop;

var eq = require('../lang/tooling').equals;

var HeadList = require('../model/head-list');
var types = require('../lang/syntax').types;
var Lexeme = require('../model/lexeme');

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
    this._map = new Map(arr);
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
  var indexMap = new IndexMap(dataPack.context || []); //TODO create dataPack.context as empty array
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
    // e.value = dataPack.gate.Spout(argIndex,eq.type.arg(e)).pipe
    e.value = getArg;
    return e;
  }
  return dataPack;
}
module.exports = { fillUserData: fillUserData };