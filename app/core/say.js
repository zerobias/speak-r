const R = require('ramda')
const HeadList = require('../model/head-list')
const Lexeme = require('../model/lexeme')
const util = require('../util')
const P = util.P
const pipelog = util.pipelog('tree')
const Outfall = require('../model/outfall')
const eq = require('../lang/tooling').equals

const Context = require('./context')

function CompileException(obj) {
  this.message = `Can not compile object ${obj}`
  this.name = 'Compile exeption'
}

function collectData(obj) {
  const collect = R.cond([
    [R.is(Array), sayPipe],
    [Lexeme.its.pipe, sayPipe],

    // [eq.type.arg,P(pipelog('arg'),R.prop('pipe'))],
    [Lexeme.its.atomic, sayAtomic],
    [P(HeadList.isList, R.not), util.prop.val],
    [R.T, e => {throw new CompileException(e)}]
  ])
  return collect(obj)
}

function sayPipe(list) {
  const normalize = R.when(HeadList.isList, R.prop('toArray'))
  return P(normalize, R.map(collectData), R.apply(R.pipe))(list)
}

function sayAtomic(list) {
  const applyTailToHead =
    () => R.apply(
      collectData(list.head),
      R.map(collectData, list.tail))
  return HeadList.hasTail(list)
    ? applyTailToHead()
    : collectData(list.head)
}

const contextArgs = R.map(util.prop.val)


class Runner {
  get source() {
    return this.data.source
  }
  get args() {
    return contextArgs(this.data.context)
  }
  constructor(dataPack) {
    this.data = dataPack
    return (...userArgs) => {
      dataPack.gate.pipe(userArgs)
      const filled = Context.fillUserData(userArgs, dataPack)
      const render = collectData(filled.tree)
      return render(...userArgs)
    }
  }
}

function say(sourceString) {
  return function(dataPack) {
    dataPack.source = sourceString
    dataPack.gate = Outfall.gate
    return new Runner(dataPack)
  }
}

say.sayPipe = sayPipe
say.collectData = collectData

module.exports = say