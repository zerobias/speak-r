const R = require('ramda')
const S = require('sanctuary')
const syntax = require('./lang/syntax')


const Token = require('./token.js')
const util = require('./util')
const isString = util.isString
// const log = util.log('fabric')
// const pipelog = util.pipelog('fabric')

const TokenFabric = (tokenType, condition, transformation) => {
  const onCondition = R.pipe(util.arrayify, R.allPass, S.either(R.__, R.F))
  const addSteps = R.flip(R.concat)([tokenType, S.Right])
  const transformUntouched = R.pipe(
    R.defaultTo([]),
    util.arrayify,
    addSteps,
    util.toPipe,
    S.either(R.__, R.identity))
  return R.when(onCondition(condition), transformUntouched(transformation))
}

const quoteProcessor = function () {
  const isQuote = R.anyPass(R.map(R.equals, syntax.quotes))
  const isQuoted = R.allPass(R.map(e => R.pipe(e, isQuote), [R.head, R.last]))
  const removeQuotes = R.pipe(R.init, R.tail)
  return TokenFabric(Token.String, [isString, isQuoted], [R.trim, removeQuotes])
}
const typesProcessor = () => {
  const types = new Map(syntax.jstypes)
  const isInMap = obj => isString(obj) ? types.has(obj) : false
  return TokenFabric(Token.Type, isInMap, e => types.get(e))
}

const isNumber = TokenFabric(Token.Number, isFinite, parseFloat)
const vendorProcessor = () => {
  const isFunc = R.is(Function)
  const isRamda = obj => isFunc(R[obj])
  return TokenFabric(Token.R, [isString, isRamda], R.prop(R.__, R))
}
const contextValidation = str => R.pipe(R.match(/\D\w+/), R.head, R.equals(str))(str)
const isContext = TokenFabric(Token.Context, contextValidation)

const preprocess = S.lift(R.when(isString, R.trim))
const postprocess = R.identity
module.exports = {
  isQuote: quoteProcessor(),
  isType: typesProcessor(),
  isVendor: vendorProcessor(),
  isNumber,
  isContext,
  preprocess,
  postprocess
}