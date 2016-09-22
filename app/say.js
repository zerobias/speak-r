const R = require('ramda')
const HeadList = require('./head-list.js')
const Lexeme = require('./lexeme.js')
const util = require('./util')
const S = util.S
const P = util.P
const log = util.log('tree')
const prop = util.prop
const types = require('./lang/syntax').types
const eq = require('./lang/tooling').equals
const claim = require('./claim')

function detectContext(context) {
  if (!context) return R.identity

  let nameIndexMap = new Map(context.map((e,i)=>[e.value,i]))
  return function(data) {
    context
    R
    S
    let modClaim = new claim.Claimed()
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
    // let res = mapMod(data)
    return new Promise(resolve => {
      log('data')(data)
      let claimedData = modClaim.onData(data)
      log('claimed')(claimedData)
      resolve(claimedData)
    }).then(value => {
      log('resolved')(value)
      return R.map(modifyRef)(value)
    },log('err detectContext'))
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

function say(data) {
  return collectData(data)
}

module.exports = say