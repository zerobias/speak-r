'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var R = require('ramda');

var util = require('./util');
var S = util.S;

var P = util.P;
var log = util.log('tree');
// const pipelog = util.pipelog('tree')

var HeadList = require('./model/head-list');

var Print = function () {
  function Print() {
    _classCallCheck(this, Print);
  }

  _createClass(Print, null, [{
    key: '_indexTag',
    value: function _indexTag(tag) {
      return function (e) {
        var separ = arguments.length <= 1 || arguments[1] === undefined ? ' ' : arguments[1];
        return P(util.arrayify, R.prepend(tag), R.join(separ), log)(e);
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
    // static get typeOrOper() {return R.ifElse(isOperator,prop.val,prop.type)}

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