const R = require('ramda')
const util = require('./util')
const S = require('sanctuary')

const Token = require('./token.js')
const log = util.pipelog('splitter')
const operators = require('./syntax.js').operators

const toPipe = util.toPipe
const stringMorpher = morph=>R.map(R.when(util.isString,morph))
const stringTrim = stringMorpher(R.trim)
const rejectEmpty = R.reject(R.isEmpty)

const opersFuncs = [
  R.split,
  R.pipe(Token.Operator,R.intersperse)
]
const constFuncs = [
  rejectEmpty,
  R.unnest
]

const splitCond = symb=>R.cond([
  [R.is(String),symb],
  [R.T,log('uncaught')]
])
const unnester = symbPipe=>R.pipe(
  symbPipe,
  R.unnest)
const splitsPipe = [
  R.of,
  R.ap(opersFuncs),
  R.concat(R.__,constFuncs),
  toPipe,
  splitCond,
  R.map,
  unnester,
  log('splitPipe')]
const splitter = R.pipe(toPipe,R.map(R.__,operators),toPipe)(splitsPipe)
const cleaner = R.pipe(R.unnest,stringTrim,rejectEmpty,log('end'))
const execFuncs = [
  util.arrayify,
  splitter,
  cleaner]
const exec = toPipe(execFuncs)
module.exports = {exec,cleaner}