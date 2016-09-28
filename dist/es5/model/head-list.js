'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var R = require('ramda');

var util = require('../util');
var S = util.S;

var P = util.P;

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
    this[Symbol.iterator] = regeneratorRuntime.mark(function _callee() {
      var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, e;

      return regeneratorRuntime.wrap(function _callee$(_context) {
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
              _iterator = this.tail[Symbol.iterator]();

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
          for (var _iterator2 = list[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
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