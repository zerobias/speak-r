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

const contextArgs = P(
  R.when(R.equals(false), () => []),
  R.when(
    util.isof.Empty,
    R.append({ type: 'fakeContext', value: 'data' })),
  R.map(util.prop.val))

function Runner(dataPack) {
  const obj = function(...userArgs) {
    dataPack.gate.pipe(userArgs)
    const filled = Context.fillUserData(userArgs, dataPack)
    const render = collectData(filled.tree)
    return render(...userArgs)
  }
  Object.defineProperty(obj, 'data', {
    value: dataPack
  })
  Object.defineProperty(obj, 'source', { get:
    function() { return obj.data.source }
  })
  Object.defineProperty(obj, 'args', { get:
    function() { return contextArgs(obj.data.context) }
  })
  return obj
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