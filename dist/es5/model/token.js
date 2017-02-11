'use strict';

var R = require('ramda');
var types = require('../lang/syntax').types;

var TokenFabric = R.curry(function (category, obj) {
  return {
    type: category,
    value: obj
  };
});

module.exports = R.map(function (e) {
  return TokenFabric(types[e]);
}, {
  Type: 'type',
  R: 'R',
  String: 'string',
  Number: 'number',
  Operator: 'op',
  Any: 'any',
  Context: 'context',
  Arg: 'arg'
});