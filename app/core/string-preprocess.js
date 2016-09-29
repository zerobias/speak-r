const R = require('ramda')

const fab = require('./fabric')

const splitter = require('./splitter')

const util = require('../util')
const P = util.P
const S = util.S
const Err = require('../model/error')

const pipelog = util.pipelog('preproc')
const singleWordParsing =
  P(
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
function splitKeywords(data) {
  const err = R.unless(util.isString, () => { throw new Error('`keywords` should be String'); })
  const beforeSplit = P(
    err,
    R.split(' '),
    R.reject(R.isEmpty))
  const sSort = R.map(R.ifElse(R.is(Object),S.Right,S.Left))
  const _drops = (a,b)=>R.allPass([
    R.propEq('type','operator'),
    R.propEq('obj',','),
    R.eqProps('obj',R.__,b)
  ])(a)
  const drops = R.dropRepeatsWith(_drops)
  let un = P(
    beforeSplit,
    splitter.exec,
    sSort,
    pipelog('тэг'),

    R.map(singleWordParsing),
    drops
  )
  let splitted = un(data)
  Err.Throw.Token(splitted)
  return splitted
}


module.exports = splitKeywords