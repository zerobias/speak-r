'use strict';

var util = require('../util');
var R = require('ramda');
var P = util.P;
var log = util.pipelog('tree');
var pipelog = util.pipelog('tree');

function Outfall() {
  this.id = Math.round(Math.random() * 10e5);
  this.updated = false;
  this._data = null;
}

Object.defineProperty(Outfall, 'gate', { get: function get() {
    return new Outfall();
  } });
Object.defineProperty(Outfall.prototype, 'pipe', {
  get: function get() {
    var self = this;
    return function (data) {
      self.updated = true;
      self._data = data;
      return data[0];
    };
  }
});

Outfall.prototype.Spout = function (index) {
  var isArg = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

  return Spout(this, index, isArg);
};

function Spout(parent, index, isArg) {
  var spout = Object.create(parent, {
    data: { get: function get() {
        return parent._data;
      }, enumerable: true },
    index: { get: function get() {
        return index;
      }, enumerable: true },
    id: { get: function get() {
        return parent.id;
      }, enumerable: true },
    isArg: { value: isArg, enumerable: true }
  });
  Object.defineProperty(spout, 'pipe', { value: function value() {
      log('spout pipe')(spout.data[spout.index], spout);
      if (R.isNil(spout.data)) return null;
      return spout.isArg ? spout.data[spout.index] : spout.data[spout.index];
    },
    enumerable: true });
  return spout;
}

// let stream = Outfall.gate
// let joint = stream.Spout()

module.exports = Outfall;