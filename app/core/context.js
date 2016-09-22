const R = require('ramda')

const util = require('../util')
const P = util.P
const S = util.S
const log = util.log('tree')
const prop = util.prop

const eq = require('../lang/tooling').equals
const Claim = require('../model/claim')

function detectContext(context) {
  if (!context) return R.identity

  let nameIndexMap = new Map(context.map((e,i)=>[e.value,i]))
  return function(data) {
    context
    R
    S
    let modClaim = new Claim()
    const chain = func=>o=>o.chain(func)
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
    /*return new Promise(resolve => {
      log('data')(data)
      let claimedData = modClaim.onData(data)
      log('claimed')(claimedData)
      resolve(claimedData)
    }).then(value => {
      log('resolved')(value)
      return R.map(modifyRef)(value)
    },log('err detectContext'))*/
  }
}

module.exports = detectContext