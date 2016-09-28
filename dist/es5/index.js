'use strict';

var R = require('ramda');

var preproc = require('./core/string-preprocess');
var getTree = require('./core/tree');
var convolve = require('./core/convolve');
var Speak = require('./core/say');

var util = require('./util');
var P = util.P;
var log = util.log('index');
var pipelog = util.pipelog('index');
var Print = require('./print');

var taplog = function taplog(tag) {
  return R.tap(function (e) {
    return Print.headList(tag, e.tree, -1);
  });
};

var maptaphead = function maptaphead(tag) {
  return R.tap(P(R.prop('tree'), R.map(function (e) {
    return Print.headList(tag, e, -1);
  })));
};

var mapprint = function mapprint(tag) {
  return R.tap(R.map(pipelog(tag)));
};

function say(data) {
  return P(preproc, mapprint('preproc'), getTree, maptaphead('getTree'), convolve, taplog('conv'), Speak(data))(data);
}

var pureExample = "indexes data sright :: head prop 'index' concat @data sright";
var simple = "when <| == 1 not <|> + 10 |> + 100";
// const pure = P( R.when(P(R.equals(1),R.not),R.add(10)),R.add(100))

// let convolved = say(pureExample)
log('example')(pureExample);

// Print.headList('conv',convolved,-1)
var word = say(pureExample);
var indexes = [{ index: [1, 3] }, { index: [0, 1, 2, 3] }, 0];
var dat = [0, 5, 20, 30, 40, 50];
var sright = R.objOf('result');
// let flipap = R.flip(R.append)
var res = word(indexes, dat, sright);
log('res')(res);

module.exports = say;