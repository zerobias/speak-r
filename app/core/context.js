const R = require('ramda')

const util = require('../util')
const P = util.P
const S = util.S
const log = util.log('tree')
const pipelog = util.pipelog('tree')
const prop = util.prop

const eq = require('../lang/tooling').equals
const Claim = require('../model/claim')
const HeadList = require('../model/head-list')
const types = require('../lang/syntax').types
const Lexeme = require('../model/lexeme')

const chain = func=>o=>o.chain(func)
function detectContext(context) {
  if (!context) return R.identity

  let nameIndexMap = new Map(context.map((e,i)=>[e.value,i]))
  return function(data) {
    context
    R
    S
    let modClaim = new Claim()

    const modify = e=>{
      nameIndexMap

      const mapHas = o=>nameIndexMap.has(o)
      const mapGet = o=>nameIndexMap.get(o)
      const valuePath = R.lensProp('value')
      const hasCurrent = P(prop.val,mapHas)
      let createClaimer = P(mapGet,o=>modClaim.Claimer({index:o,isArg:eq.type.arg(e.value)}).data)
      const setCurrent = R.over(valuePath,createClaimer)
      // const isContextOrArg = eq.type.context.arg()
      // const validate = R.allPass([isContextOrArg,hasCurrent])


      const modmod = chain(R.ifElse(hasCurrent,P(setCurrent,S.Right),S.Left))
      return modmod(e)
    }
    // let claimedToken = S.Right({index:-1,type:types.R, value:modClaim.onData})
    // const addClaimedToken = R.prepend(claimedToken)
    const modifyRef = R.when(chain(eq.type.context.arg),modify)
    // const mapMod = P(R.map(modifyRef),addClaimedToken)
    let res = data
    return res
  }
}
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
function insertClaim(dataPack) {
  if (!dataPack.context) return dataPack //Possibly not nessessary
  let indexMap = new IndexMap(dataPack.context)
  let tree = dataPack.tree
  let modClaim = new Claim()
  const modify = e=>{
    const createClaimer = P(indexMap.get,pipelog('index map'),o=>modClaim.Claimer({
      index:o,
      isArg:eq.type.arg(e)}),pipelog('claimer'),util.prop.data,pipelog('claim data'))
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
    {index:-1,type:types.R, value:modClaim.onData})
  dataPack.tree = P(morpher,HeadList.prepend(claimPipe))(tree)
  return dataPack
}
module.exports = insertClaim