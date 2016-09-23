"use strict";
const R = require('ramda')

const util = require('../util')
const P = util.P
const S = util.S
const log = util.log('tree')
const pipelog = util.pipelog('tree')
const prop = util.prop

const eq = require('../lang/tooling').equals
const Outfall = require('../model/outfall')
const HeadList = require('../model/head-list')
const types = require('../lang/syntax').types
const Lexeme = require('../model/lexeme')

const chain = func=>o=>o.chain(func)
class IndexMap {
  static get indexation() {
    return R.addIndex(R.map)((e,i)=>R.pair(e.value,i))
  }
  constructor(context) {
    let arr = IndexMap.indexation(context)
    log('index map')(arr)
    this._map = new Map(arr)
  }
  get has() {
    let self = this._map
    return function(e){return self.has(e)}
  }
  get get() {
    let self = this._map
    return function(e){return self.get(e)}
  }
  get hasVal() {
    let has = this.has
    return P(prop.val,has)
  }
}
function insertRefs(dataPack) {
  if (!dataPack.context) return dataPack //Possibly not nessessary

  let tree = dataPack.tree
  let gate = Outfall.gate
  const makeAtomic = P(e=>new HeadList([e]),Lexeme.AtomicFunc)

  R


  let gateToken = {
    index:-1,
    type:types.R,
    value:gate.pipe}
  // let gateLexeme = makeAtomic(gateToken)
  dataPack.gate = gate
  // dataPack.tree = P(HeadList.prepend(gateLexeme))(tree)
  return dataPack
}
function fillUserData(userData,dataPack) {
  let indexMap = new IndexMap(dataPack.context)
  const isArgOrCont = eq.type.arg.context
  const morpher = HeadList.cyclic(modify)
  dataPack.tree = morpher(dataPack.tree)
  function modify(e) {

    if (!isArgOrCont(e)) return e
    log('ee')(e,isArgOrCont(e))
    if (!indexMap.hasVal(e))
      log('ERRRROR!')(e)
    let argIndex = indexMap.get(e.value)
    let getArg = userData[argIndex]
    log('refs')(e.type,argIndex,getArg)
    e.value = dataPack.gate.Spout(argIndex,eq.type.arg(e)).pipe
    // return R.when(eq.type.arg,o=>{
    //   // o.value = o.value()
    //   return o//makeAtomic(o)
    // })(e)
    e.value = getArg
    return e
  }

  // dataPack.gate.
  return dataPack
}
function insertClaim(dataPack) {
  if (!dataPack.context) return dataPack //Possibly not nessessary
  let indexMap = new IndexMap(dataPack.context)
  let tree = dataPack.tree
  let stream = Outfall.gate
  let modify = e=>{
    const createClaimer = P(
      indexMap.get,pipelog('index map'),
      o=>stream.Spout(o,eq.type.arg(e)),
      pipelog('joint'),
      R.prop('pipe'),pipelog('joint data'))
    const setCurrent = o=>{
      log('o')(o)
      o.value = createClaimer(o.value)
      log('o')(o)
      return o
    }
    const modmod = R.ifElse(indexMap.hasVal,P(setCurrent,S.Right),S.Left)
    return modmod(e)
  }
  const morpher = HeadList.cyclic(modify)
  let claimPipe = P(e=>new HeadList([e]),Lexeme.AtomicFunc)(
    {index:-1,type:types.R, value:stream.pipe})
  dataPack.tree = P(morpher,HeadList.prepend(claimPipe))(tree)
  return dataPack
}
module.exports = {insertRefs, fillUserData}