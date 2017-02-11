'use strict';

var R = require('ramda');
var syntax = require('../lang/syntax');

var Token = require('../model/token');
var util = require('../util');
var S = util.S;
var P = util.P;

var isString = util.isString;
// const log = util.log('fabric')
// const pipelog = util.pipelog('fabric')

function TokenFabric(tokenType, condition, transformation) {
  var onCondition = P(util.arrayify, R.allPass, S.either(R.__, R.F));
  var appendArray = R.flip(R.concat);
  var addSteps = appendArray([tokenType, S.Right]);
  var transformUntouched = P(util.arrayify, addSteps, P, function (e) {
    return S.either(e, R.identity);
  });
  return R.when(onCondition(condition), transformUntouched(transformation));
}

var quoteProcessor = function quoteProcessor() {
  var isQuote = R.anyPass(R.map(R.equals, syntax.quotes));
  var isQuoted = R.allPass([P(R.head, isQuote), P(R.last, isQuote)]);
  var removeQuotes = P(R.init, R.tail);
  return TokenFabric(Token.String, [isString, isQuoted], [R.trim, removeQuotes]);
};
var typesProcessor = function typesProcessor() {
  var types = new Map(syntax.jstypes);
  var isInMap = function isInMap(obj) {
    return isString(obj) ? types.has(obj) : false;
  };
  return TokenFabric(Token.Type, isInMap, function (e) {
    return types.get(e);
  });
};

var isNumber = TokenFabric(Token.Number, isFinite, parseFloat);
var vendorProcessor = function vendorProcessor() {
  var isFunc = R.is(Function);
  var isRamda = function isRamda(obj) {
    return isFunc(R[obj]);
  };
  return TokenFabric(Token.R, [isString, isRamda], R.prop(R.__, R));
};
var contextValidation = function contextValidation(str) {
  return P(R.match(/\D\w+/), R.head, R.equals(str))(str);
};
var isContext = TokenFabric(Token.Context, contextValidation);
var argValidation = R.both(P(R.head, R.equals('@')), P(R.tail, contextValidation));
var isArg = TokenFabric(Token.Arg, argValidation, R.tail);

var preprocess = S.lift(R.when(isString, R.trim));
var postprocess = R.identity;
module.exports = {
  isQuote: quoteProcessor(),
  isType: typesProcessor(),
  isVendor: vendorProcessor(),
  isNumber: isNumber,
  isContext: isContext,
  isArg: isArg,
  preprocess: preprocess,
  postprocess: postprocess
};