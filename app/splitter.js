const R = require('ramda')
const util = require('./util')
const S = require('sanctuary')

const Token = require('./token.js')
const log = util.pipelog('splitter')
const operators = require('./syntax.js').operators

const toPipe = util.toPipe
const stringMorpher = morph=>R.pipe(R.map(R.when(R.is(String),morph)))
const stringTrim = stringMorpher(R.trim)
const rejectEmpty = R.reject(R.isEmpty)

const opersFuncs = [
  R.split,
  R.pipe(Token.Operator,R.intersperse)
]
const constFuncs = [
  rejectEmpty,
  R.unnest,
  // log('string pipe')
]

const splitCond = symb=>R.cond([
  [R.is(String),symb],
  [R.T,log('uncaught')]
])
const unnester = symbPipe=>R.pipe(
  symbPipe,
  // log('symbPipe'),
  R.unnest)
const splitsPipe = [
  // log('before conver'),
  R.of,
  R.ap(opersFuncs),
  // log('conver'),
  R.concat(R.__,constFuncs),
  toPipe,
  // log('pp1'),
  splitCond,
  R.map,
  // log('splitCond'),
  unnester,
  log('splitPipe')]
const splitter = R.pipe(toPipe,R.map(R.__,operators),toPipe)(splitsPipe)
const cleaner = R.pipe(R.unnest,stringTrim,rejectEmpty,log('end'))
// log('spl')(splitter)

const anyToArray = R.when(R.complement(R.is(Array)),R.of)
const execFuncs = [
  // log('start'),
  anyToArray,
  splitter,
  cleaner]
const exec = toPipe(execFuncs)
module.exports = {exec,cleaner}