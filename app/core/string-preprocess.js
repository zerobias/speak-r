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
function splitKeywords(data) {
  const err = R.unless(util.isString, () => { throw new Error('`keywords` should be String'); })
  const beforeSplit = R.pipe(
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
  let un = R.unary(R.pipe(
    beforeSplit,
    splitter.exec,
    sSort,
    pipelog('тэг'),

    R.map(singleWordParsing),
    drops
  ))
  fab
  return un(data)
}


module.exports = splitKeywords