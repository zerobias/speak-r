'use strict';

var R = require('ramda');

var fab = require('./fabric');

var splitter = require('./splitter');

var util = require('../util');
var S = util.S;

var pipelog = util.pipelog('preproc');
var singleWordParsing = R.pipe(fab.preprocess, pipelog('->isQuote'), fab.isQuote, pipelog('->isNumber'), fab.isNumber, pipelog('->isType'), fab.isType, pipelog('->isVendor'), fab.isVendor, pipelog('->isArg'), fab.isArg, pipelog('->isContext'), fab.isContext, pipelog('->postprocess'), fab.postprocess);
function splitKeywords(data) {
  var err = R.unless(util.isString, function () {
    throw new Error('`keywords` should be String');
  });
  var beforeSplit = R.pipe(err, R.split(' '), R.reject(R.isEmpty));
  var sSort = R.map(R.ifElse(R.is(Object), S.Right, S.Left));
  var _drops = function _drops(a, b) {
    return R.allPass([R.propEq('type', 'operator'), R.propEq('obj', ','), R.eqProps('obj', R.__, b)])(a);
  };
  var drops = R.dropRepeatsWith(_drops);
  var un = R.unary(R.pipe(beforeSplit, splitter.exec, sSort, pipelog('тэг'), R.map(singleWordParsing), drops));
  fab;
  return un(data);
}

module.exports = splitKeywords;