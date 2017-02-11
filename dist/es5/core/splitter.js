'use strict';

var R = require('ramda');
var util = require('../util');
var P = util.P;

var Token = require('../model/token');
var log = util.pipelog('splitter');
var operators = R.values(require('../lang/syntax').op); //TODO rewrite op list using

var stringMorpher = function stringMorpher(morph) {
  return R.map(R.when(util.isof.String, morph));
};
var stringTrim = stringMorpher(R.trim);
var rejectEmpty = R.reject(R.isEmpty);

var opersFuncs = [R.split, P(Token.Operator, R.intersperse)];

var constFuncs = [rejectEmpty, R.unnest];

var splitCond = function splitCond(symb) {
  return R.cond([[util.isof.String, symb], [R.T, log('uncaught')]]);
};
var unnester = function unnester(symbPipe) {
  return P(symbPipe, R.unnest);
};
var splitsPipe = [R.of, R.ap(opersFuncs), R.concat(R.__, constFuncs), P, splitCond, R.map, unnester, log('splitPipe')];
var splitter = P(P, R.map(R.__, operators), P)(splitsPipe);
var cleaner = P(R.unnest, stringTrim, rejectEmpty, log('end'));
var execFuncs = [util.arrayify, splitter, cleaner];
var exec = P(execFuncs);
module.exports = { exec: exec, cleaner: cleaner };