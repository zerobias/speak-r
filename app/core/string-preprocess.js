const R = require('ramda')

const fab = require('./fabric')

const splitter = require('./splitter')

const util = require('../util')
const S = util.S

const pipelog = util.pipelog('preproc')
const singleWordParsing =
  R.pipe(
    fab.preprocess,
    pipelog('->isQuote'),
    fab.isQuote,
    pipelog('->isNumber'),
    fab.isNumber,
    pipelog('->isType'),
    fab.isType,
    pipelog('->isVendor'),
    fab.isVendor,
    pipelog('->isArg'),
    fab.isArg,
    pipelog('->isContext'),
    fab.isContext,
    pipelog('->postprocess'),
    fab.postprocess)
const splitKeywords=
  R.unary(R.pipe(
    R.unless(util.isString, () => { throw new Error('`keywords` should be String'); }),

    R.split(' '),

    R.reject(R.isEmpty),
    splitter.exec,
    R.map(R.ifElse(R.is(Object),S.Right,S.Left)),
    pipelog('тэг'),

    R.map(singleWordParsing),
    R.dropRepeatsWith((a,b)=>R.allPass([
      R.propEq('type','operator'),
      R.propEq('obj',','),
      R.eqProps('obj',R.__,b)
    ])(a))
  ))


module.exports = splitKeywords