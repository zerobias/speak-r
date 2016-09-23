const R = require('ramda')
const HeadList = require('../model/head-list')
const Lexeme = require('../model/lexeme')
const util = require('../util')
const P = util.P
const pipelog = util.pipelog('tree')

const eq = require('../lang/tooling').equals

const Context = require('./context')

function CompileException(obj) {
  this.message = `Can not compile object ${obj}`
  this.name = "Compile exeption"
}

function collectData(obj) {
  const collect = R.cond([
    [R.is(Array),sayPipe],
    // [Lexeme.its.arg,P(R.path(['head','value']),e=>e.arg())],
    [Lexeme.its.pipe,sayPipe],

    // [eq.type.arg,P(pipelog('arg'),R.prop('pipe'))],
    [Lexeme.its.atomic,sayAtomic],
    [P(HeadList.isList,R.not),util.prop.val],
    [R.T,e=>{throw new CompileException(e)}]
  ])
  return collect(obj)
}

function contextInjecting(dataPack) {
  const onlyFirst = R.head
  let withRefs = Context.insertRefs(dataPack)
  return function(...userArgs) {
    withRefs.gate.pipe(userArgs)
    let filled = Context.fillUserData(userArgs,withRefs)
    let render = collectData(filled.tree)
    return render(...userArgs)
  }
}

function sayPipe(list) {
  const normalize = R.when(HeadList.isList,R.prop('toArray'))
  return P(normalize,R.map(collectData),R.apply(R.pipe))(list)
}

function sayAtomic(list) {
  return HeadList.hasTail(list)
    ? R.apply(collectData(list.head),R.map(collectData,list.tail))
    : collectData(list.head)
}

function say(dataPack) {
  return contextInjecting(dataPack)
}

module.exports = say