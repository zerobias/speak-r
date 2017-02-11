'use strict';

var R = require('ramda');
var debug = require('debug');

var RP = require('./model/ramda-piped');

var pipefy = require('./pipefy');
var P = pipefy;

var isof = {
  String: R.is(String),
  Func: R.is(Function),
  Array: R.is(Array),
  Nil: R.isNil,
  Real: function Real(e) {
    return !R.isNil(e);
  },
  Empty: R.isEmpty,
  Full: function Full(e) {
    return !R.isEmpty(e);
  }
};

var tagvalue = function tagvalue(tag, mess) {
  return isof.Nil(mess) ? tag : [tag, mess].join(':  ');
};
var log = function log(tag) {
  return function (mess) {
    return debug(tagvalue(tag, mess));
  };
};
var pipelog = function pipelog(tag) {
  return function (mess) {
    return R.tap(log(tag)(mess));
  };
};

var arrayify = R.pipe(R.defaultTo([]), R.unless(isof.Array, R.of));

// const P = (...pipes)=>R.apply(R.pipe,R.filter(isof.Func,pipes))


var isContainOrEq = P(arrayify, R.flip(R.contains));

var _require = require('sanctuary');

var create = _require.create;
var env = _require.env;

var checkTypes = false; //process.env.NODE_ENV !== 'production';
var S = create({ checkTypes: checkTypes, env: env });

var prop = R.map(R.prop, {
  type: 'type',
  val: 'value',
  head: 'head',
  tail: 'tail',
  data: 'data'
});

var isString = isof.String;

module.exports = {
  pipelog: pipelog, log: log, isString: isString, arrayify: arrayify, P: P, isof: isof, isContainOrEq: isContainOrEq, prop: prop, RP: RP, S: S
};