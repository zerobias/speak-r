'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var R = require('ramda');

var lexemeTypes = require('../lang/syntax').lexemeTypes;

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