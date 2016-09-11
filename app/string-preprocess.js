const R = require('ramda')
const S = require('sanctuary')

const fab = require('./fabric.js')

// const syntax = require('./syntax.js')
// const tree = require('./tree.js')
const splitter = require('./splitter.js')

const util = require('./util')

// const log = util.log('preproc')
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