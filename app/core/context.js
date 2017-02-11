const { addIndex, map, useWith, pair, prop, identity, unless } = require('ramda')

const util = require('../util')
const P = util.P
const S = util.S
const log = util.log('tree')
const pipelog = util.pipelog('tree')
const rProp = util.prop

const eq = require('../lang/tooling').equals

const HeadList = require('../model/head-list')
const types = require('../lang/syntax').types
const Lexeme = require('../model/lexeme')
const Err = require('../model/error')

const chain = func => o => o.chain(func)

const indexation = addIndex(map)(useWith(pair, [prop('value'), identity]))

class IndexMap {
  constructor(context = []) {
    const arr = indexation(context)
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
    return P(rProp.val, has)
  }
}
const errorCheck = unless(util.isof.Empty, Err.Throw.Args)
const callNotFunc = (token, userArg) => eq.type.context(token)&&!util.isof.Func(userArg)
function fillUserData(userData, dataPack) {
  const indexMap = new IndexMap(dataPack.context) //TODO create dataPack.context as empty array
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