const R = require('ramda')

const util = require('../util')
const P = util.P
const S = util.S
const log = util.log('tree')
const pipelog = util.pipelog('tree')
const prop = util.prop

const eq = require('../lang/tooling').equals

const HeadList = require('../model/head-list')
const types = require('../lang/syntax').types
const Lexeme = require('../model/lexeme')
const Err = require('../model/error')

const chain = func => o => o.chain(func)
class IndexMap {
  static get indexation() {
    return R.addIndex(R.map)((e, i) => R.pair(e.value, i))
  }
  constructor(context) {
    const arr = IndexMap.indexation(context)
    log('index map')(arr)
    this._map = new Map(arr)
  }
  get has() {
    const self = this._map
    return function(e){return self.has(e)}
  }
  get get() {
    const self = this._map
    return function(e){return self.get(e)}
  }
  get hasVal() {
    const has = this.has
    return P(prop.val, has)
  }
}
const errorCheck = R.unless(R.isEmpty, Err.Throw.Args)
const callNotFunc = (token, userArg) => eq.type.context(token)&&!R.is(Function, userArg)
function fillUserData(userData, dataPack) {
  const indexMap = new IndexMap(dataPack.context||[]) //TODO create dataPack.context as empty array
  const isArgOrCont = eq.type.arg.context
  const morpher = HeadList.cyclic(modify)
  const errors = new Set()
  dataPack.tree = morpher(dataPack.tree)
  function modify(e) {

    if (!isArgOrCont(e)) return e
    log('ee')(e, isArgOrCont(e))
    if (!indexMap.hasVal(e))
      log('ERRRROR!')(e) //TODO Detect using undefined context earlier
    const argIndex = indexMap.get(e.value)
    const getArg = userData[argIndex]
    if (callNotFunc(e, getArg))
      errors.add({ argument: e.value, value: getArg })
    log('refs')(e.type, e.value, argIndex, getArg)
    // e.value = dataPack.gate.Spout(argIndex,eq.type.arg(e)).pipe
    e.value = getArg
    return e
  }
  errorCheck([...errors.values()])
  return dataPack
}
module.exports = { fillUserData }