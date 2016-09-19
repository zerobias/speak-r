const R = require('ramda')

const util = require('./util')
const S = util.S

const P = util.P
const RP = util.RP
// const log = util.log('tree')
const pipelog = util.pipelog('tree')
const prop = util.prop

const Lexeme = require('./lexeme.js')
const HeadList = require('./head-list.js')

const types = require('./lang/syntax').types
const tool = require('./lang/tooling')
const eq = tool.equals
const Print = require('./print')
const tapArr = tag=> R.tap(e=>e.map((o,i)=>pipelog(tag+' '+i)(o)))
// const example = "tokens :: Array prop 'type' indexOf _ 'tokens' equals -1 not"
// const exampleNoDef = "prop 'type' indexOf _ 'tokens' equals -1 not"
//const onChecking = P(  R.prepend(  R.take(2) , R.equals('|>') ) , R.apply(R.ifElse) )
//const __tranducer = P(R.ifElse(P(R.prop('value'),R.propEq('type','R')),P(R.prop('value'),R.of,R.append)),R.map)
// const exampleTrans = "ifElse <| prop 'value' propEq 'type' 'R' <|> prop 'value' of append |> map" // _ identity

// const isTokenCat = tokenArray=>P(prop.type,util.isContainOrEq(tokenArray))


const filterM = func=>e=>e.filter(func)
const filterMs = func=>P(R.map(filterM(func)),S.justs)
// const indexOf = e => e.isJust ? e.value.index : NaN
// const rangeMs = (min,max)=>R.map(R.reject(e=>indexOf(R.either(R.gt(max),R.lt(min)))))

//TODO make isSymbol and other work through R.whereEq
// const isSymbol = tokenPred => R.allPass([isOperator, propEqVal(tokenPred)])
// const eq.op = R.map(isSymbol,op)

const eitherToMaybe = R.map(S.eitherToMaybe)

function indexation(data) {
  const indexPipe = (e,i)=>S.lift(R.assoc('index',i))(e)
  const _indexation = list=>list.map(indexPipe)
  return _indexation(data)
}

const valEq = R.propEq('value')
const check =func=> e=>R.both(S.isRight,valEq(true))(S.lift(func,e))
function stageHeader(data) {
  const eiSplitOn = func=>P(R.splitWhen(check(func)), R.adjust(R.tail,1))

  const splitContext = eiSplitOn(eq.op.doubledots)
  const splitDefine = eiSplitOn(eq.op.define)
  const writeField = (field,obj)=>res=>{
    if (R.isEmpty(res[1])) {
      obj[field] = false
      return res[0]
    } else {
      obj[field] = S.rights(res[0])
      return res[1]
    }
  }
  let props = {}
  let res = P(splitDefine,writeField('define',props),splitContext,writeField('context',props))
  props.data = res(data)
  return props
}
const replacer = (type,value)=>e=>{
  e.value = value
  e.type = type
  return e
}
function injectContext(data) {
  if (!data.context) return data
  const makeFunc = P(R.assoc('type',types.F),R.assoc('meta','func'),R.assoc('link','func'))
  const makeVal = P(R.assoc('type',types.any),R.assoc('meta','val'),R.over(R.lensProp('value'),R.tail))
  const changeObj = R.ifElse(P(R.prop('value'),R.head,R.equals('@')),makeVal,makeFunc)
  const getTextVals = P(S.rights,R.pluck('value'),R.pluck('value'))
  // const inject = keys=>R.when(R.contains(keys),P(R.indexOf(R.__,keys),R.lensIndex))
  // return R.when(eq.type.context,)
}
function detectContext(data) {
  // const filt = filterMs(eq.op.doubledots())//x=>R.whereEq({value:"data"},x))
  // let dd = P(filt,RP.do.head.indexOf(R.__,data).splitAt(R.__,data).adjust(R.tail,1).exec)(data)
  return data
}
function headSplitter(isMaster,onMaster,changeLast) {
  const lensLast = RP.do.length.dec.lensIndex.exec
  const onEmpty = e=>R.append(Lexeme.Pipe(new HeadList([e])))
  const onSlave = e=>list=>R.ifElse(R.isEmpty,
    onEmpty(e),
    R.over(lensLast(list),changeLast(e)))(list)
  const tranducer = R.map(R.ifElse(isMaster,onMaster,onSlave))
  return R.transduce(tranducer,(acc,val)=>val(acc))
}
function intoAtomics(data) {
  const changeLast = e=>P(util.arrayify,R.append(e.value))
  const isMaster = P(prop.val,eq.type.R.op.context)
  const onMaster = P(prop.val,R.of,R.append)

  const tr = headSplitter(isMaster,onMaster,changeLast)
  return tr([],data)
}
function intoPipes(data) {
  const changeLast = e=>hList=>hList.append(e)
  const pipeSymbols = eq.op.forwardpipe.middlepipe.backpipe
  const isMaster = R.both(HeadList.isList,P(prop.head, pipeSymbols))
  const onMaster = P(R.identity,R.append)

  const tr = headSplitter(isMaster,onMaster,changeLast)
  return tr([],data)
}

function checkReplace(data) {
  const replacers = [
    [eq.op.dash,types.any,R.__],
    [eq.op.equals,types.R,R.equals],
    [eq.op.plus,types.R,R.add],
    [eq.op.minus,types.R,R.subtract],
    [eq.op.map,types.R,R.map]
  ]
  const doCheckReplace = (checker,type,value)=>R.map(R.when(checker,replacer(type,value)))
  const reducer = (acc,val)=>R.apply(doCheckReplace,val)(acc)
  const doReplaceAll = rules=>data=>R.reduce(reducer,data,rules)
  const replAll = doReplaceAll(replacers)
  return replAll(data)
}

function lexemize(data) {
  const detectAtomic = R.when(P(prop.head,eq.type.R.context),Lexeme.AtomicFunc)
  const detectExpr   = R.when(P(prop.head,eq.type.op),Lexeme.Expression)
  const detecting = P(e=>new HeadList(e),detectAtomic,detectExpr)
  const lexemizing = P(S.lift(checkReplace),intoAtomics,R.map(detecting))
  return lexemizing(data)
}

function getSyntaxTree(data) {
  let splitted = stageHeader(data)
  // const containerFunc = pipe=>(...dataArr) =>P(R.head,pipe)(dataArr)
  return P(
    indexation,tapArr('indexation'),
    eitherToMaybe,tapArr('toMaybe'),
    detectContext,tapArr('detectContext'),
    lexemize,tapArr('lexemize'),
    intoPipes)(splitted.data)
}
let dataFirst = "value one"
let dataSec = 2
let dataThird = e=>e+'third'

const log = tag=>(...data)=>console.log(tag,R.when(e=>e.length===1,R.head)(data))
const taplog = tag=>R.tap(log(tag))
//====

class Claimer {
  constructor(index) {
    this.dataLens = R.lensIndex(index)
    this.value;
  }
  static listener(claim) {
    return data => claim.value = R.view(claim.dataLens,data)
  }
  get pipe() {
    let self = this
    return function(pipeData) {
      if (self.value)
        return self.value(pipeData)
      else {
        console.warn('empty Claimer!',self,pipeData)
        return pipeData
      }
    }
  }
}
class DataClaim {
  addListener(listenerCb) {
    this.listeners.push(Claimer.listener(listenerCb))
  }
  constructor() {
    this.listeners = []
  }

  get onData() {
    let listeners = this.listeners
    return function(data) {
      R.unless(R.isEmpty,R.forEach(e=>e(data)))(listeners)
      return R.head(data)
    }
  }
}

function modelled(...data) {
  log('modelled')(data)
  let modClaim = new DataClaim()
  let modClaimer = new Claimer(2)
  modClaim.addListener(modClaimer)
  return R.pipe(taplog('start'),modClaim.onData,modClaimer.pipe,taplog('init'))(data)
}
log('mod')(modelled(dataFirst,dataSec,dataThird))

module.exports = getSyntaxTree