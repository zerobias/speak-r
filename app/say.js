const R = require('ramda')

const HeadList = require('./head-list.js')
const Lexeme = require('./lexeme.js')
const util = require('./util')
const P = util.P

function CompileException(obj) {
  this.message = `Can not compile object ${obj}`
  this.name = "Compile exeption"
}

function collectData(obj) {
  const collect = R.cond([
    [R.is(Array),sayPipe],
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

function say(data) {
  return collectData(data)
}

module.exports = say