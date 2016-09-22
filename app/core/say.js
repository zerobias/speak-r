const R = require('ramda')
const HeadList = require('../model/head-list')
const Lexeme = require('../model/lexeme')
const util = require('../util')
const P = util.P

// const types = require('./lang/syntax').types
const eq = require('../lang/tooling').equals

const Context = require('./context')

function contextInjecting(dataPack) {
  const onlyFirst = R.head
  let render = collectData(dataPack.tree)
  let encut = P(onlyFirst,render)
  return function(...args) {
    return encut(args)
  }
}

function CompileException(obj) {
  this.message = `Can not compile object ${obj}`
  this.name = "Compile exeption"
}

function collectData(obj) {
  const collect = R.cond([
    [R.is(Array),sayPipe],
    // [Lexeme.its.arg,P(R.path(['head','value']),e=>e.arg())],
    [eq.type.arg,e=>e.value()],
    [P(HeadList.isList,R.not),util.prop.val],
    [Lexeme.its.pipe,sayPipe],
    [Lexeme.its.atomic,sayAtomic],
    [R.T,e=>{throw new CompileException(e)}]
  ])
  return collect(obj)
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