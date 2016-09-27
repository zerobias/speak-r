const R = require('ramda')
const util = require('../util')
const P = util.P

const Token = require('../model/token')
const log = util.pipelog('splitter')
const operators = R.values(require('../lang/syntax').op) //TODO rewrite op list using

const stringMorpher = morph=>R.map(R.when(util.isof.String,morph))
const stringTrim = stringMorpher(R.trim)
const rejectEmpty = R.reject(R.isEmpty)

const opersFuncs = [
  R.split,
  P(Token.Operator,R.intersperse)
]

const constFuncs = [
  rejectEmpty,
  R.unnest
]

const splitCond = symb=>R.cond([
  [util.isof.String,symb],
  [R.T,log('uncaught')]
])
const unnester = symbPipe=>P(
  symbPipe,
  R.unnest)
const splitsPipe = [
  R.of,
  R.ap(opersFuncs),
  R.concat(R.__,constFuncs),
  P,
  splitCond,
  R.map,
  unnester,
  log('splitPipe')]
const splitter = P(P,R.map(R.__,operators),P)(splitsPipe)
const cleaner = P(R.unnest,stringTrim,rejectEmpty,log('end'))
const execFuncs = [
  util.arrayify,
  splitter,
  cleaner]
const exec = P(execFuncs)
module.exports = {exec,cleaner}