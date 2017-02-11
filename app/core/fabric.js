const R = require('ramda')
const syntax = require('../lang/syntax')


const Token = require('../model/token')
const util = require('../util')

const S = util.S
const P = util.P

const isString = util.isString
// const log = util.log('fabric')
// const pipelog = util.pipelog('fabric')

function TokenFabric(tokenType, condition, transformation) {
  const onCondition = P(util.arrayify, R.allPass, S.either(R.__, R.F))
  const appendArray = R.flip(R.concat)
  const addSteps = appendArray([tokenType, S.Right])
  const transformUntouched = P(
    util.arrayify,
    addSteps,
    P,
    e => S.either(e, R.identity))
  return R.when(onCondition(condition), transformUntouched(transformation))
}

const quoteProcessor = function() {
  const isQuote = R.anyPass(R.map(R.equals, syntax.quotes))
  const isQuoted = R.allPass([P(R.head, isQuote), P(R.last, isQuote)])
  const removeQuotes = P(R.init, R.tail)
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
const contextValidation = str => P(R.match(/\D\w+/), R.head, R.equals(str))(str)
const isContext = TokenFabric(Token.Context, contextValidation)
const argValidation = R.both(P(R.head, R.equals('@')), P(R.tail, contextValidation))
const isArg = TokenFabric(Token.Arg, argValidation, R.tail)

const preprocess = S.lift(R.when(isString, R.trim))
const postprocess = R.identity
// R.tap(e=>{
//   if (e.isLeft)
//     throw Err.Throw.Token(e.value)
// })
module.exports = {
  isQuote : quoteProcessor(),
  isType  : typesProcessor(),
  isVendor: vendorProcessor(),
  isNumber,
  isContext,
  isArg,
  preprocess,
  postprocess
}