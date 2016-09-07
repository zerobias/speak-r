const R = require('ramda')
const S = require('sanctuary')

const util = require('./util')

const P = util.P
const log = util.log('tree')
const pipelog = util.pipelog('tree')

const token = require('./token.js')
const syntax = require('./syntax.js')
const Lexeme = require('./lexeme.js')
const HeadList = require('./junk.js').HeadList

const exec = require('./index.js')

const exm = [
  "* repeat _ 2 , fromPairs ",
  "'tokenArray' |> prop 'type' indexOf _ 'tokenArray' != -1",
  "propEq 'type', ifElse => isNil true propEq 'value' of append @ allPass",
  "prepend => take 2 equals '|>' , @ ifElse indexOf _"
]
const op = syntax.op
const example = "tokens :: Array prop 'type' indexOf _ 'tokens' equals -1 not"
const exampleNoDef = "prop 'type' indexOf _ 'tokens' equals -1 not"
//const onChecking = P(  R.prepend(  R.take(2) , R.equals('|>') ) , R.apply(R.ifElse) )
const __tranducer = P(R.ifElse(P(R.prop('value'),R.propEq('type','R')),P(R.prop('value'),R.of,R.append)),R.map)
const exampleTrans = "ifElse <| prop 'value' propEq 'type' 'R' <|> prop 'value' of append |> map _"
const types = P(R.map(R.repeat(R.__,2)),R.fromPairs)(syntax.types)
const isTokenCat = tokenArray=>P(R.prop('type'),R.contains(R.__,util.arrayify(tokenArray)))
const isOperator = isTokenCat(types.operator)
const ofVal = R.propEq('value')
const propType = R.prop('type')
const propVal = R.prop('value')
const propHead = R.prop('head')

const applyM = func=>S.lift(func)
const filterM = func=>e=>e.filter(func)
const filterMs = func=>P(R.map(filterM(func)),S.justs)
const indexOf = e => e.isJust ? e.value.index : NaN
const rangeMs = (min,max)=>R.map(R.reject(e=>indexOf(R.either(R.gt(max),R.lt(min)))))

const isToken = (tokenPred,typePred=types.operator) => R.useWith(R.unapply(R.allPass),[isTokenCat, ofVal])(typePred,tokenPred)

const checkToken = {
  comma:isToken(op.comma),
  doubledots:isToken(op.doubledots),
  arrow:isToken(op.arrow),
  dash:isToken(op.dash),
  backpipe:isToken(op.backpipe),
  middlepipe:isToken(op.middlepipe),
  forwardpipe: isToken(op.forwardpipe)
}
function stringTokenTransform(data) {
  const tokenGetter = S.fromMaybe(token.Any(null))
  const indexPipe = (e,i)=>P(tokenGetter,R.assoc('index',i),S.toMaybe)(e)
  const indexation = list=>list.map(indexPipe)
  return P(exec,R.map(S.eitherToMaybe),indexation)(data)
}

const maybeIndex = R.ifElse(R.gte(0),S.Maybe.empty,S.Maybe.of)
const scanPipe = P(checkToken.comma,R.findIndex,maybeIndex)

const typeCats = {
  piped:[types.R,types.context,types.lexeme],
  inserted:[types.number,types.string,types.type,types.any],
  control:[types.operator]
}

const unJustNested = R.map(S.justs)
const leftRights = S.either(R.of,unJustNested)
function stageHeader(data) {
  const errorFabric = text=>()=>S.Left(text)
  const err = R.map(errorFabric,{
    nothing:'Nothing finded',
    many:'Find more than one ::',
    other:'Undefined error'
  })
  // const split = R.splitWhen(e=>filterM(checkToken.doubledots)(e).value)
  const findDD = filterMs(checkToken.doubledots)
  const split = P(R.head,R.prop('index'),R.splitAt(R.__,data),S.Right)
  const indexChanger = index=>R.over(R.lensIndex(index))
  const overHead = indexChanger(0)
  const overBody = indexChanger(1)
  const headChange = P(filterMs(isTokenCat(types.context)),R.map(Lexeme.Context),R.map(S.Maybe.of))
  const headContextMounter = S.either(S.Left,P(overHead(headChange),overBody(R.tail),pipelog(`over`),S.Right))
  const cond = R.cond([
    [R.isEmpty,err.nothing],
    [e=>R.gt(R.length(e),1),err.many],
    [e=>R.equals(R.length(e),1),split],
    [R.T,err.other]
  ])

  return P(findDD,cond,headContextMounter)(data)
}
function headSplitter(isMaster,onMaster,onSlave) {
  const tranducer = R.map(R.ifElse(isMaster,onMaster,onSlave))
  return R.transduce(tranducer,(acc,val)=>val(acc))
}
function intoAtomics(data) {
  const changeLast = e=>P(util.arrayify,R.append(e.value))
  const lensLast = P(R.length,R.dec,R.lensIndex)
  const isMaster = P(propVal,isTokenCat([types.R,types.operator,types.context]))
  const onMaster = P(propVal,R.of,R.append)
  const onSlave = e=>list=>R.over(lensLast(list),changeLast(e),list)
  const tr = headSplitter(isMaster,onMaster,onSlave)
  return tr([],data)
}
function intoPipes(data) {
  const changeLast = e=>hList=>hList.append(e)
  const lensLast = P(R.length,R.dec,R.lensIndex)
  const pipeSymbols = R.anyPass([
    checkToken.forwardpipe,
    checkToken.middlepipe,
    checkToken.backpipe])
  const isMaster = R.both(R.has('head'),P(propHead, pipeSymbols))//propHead,
  const onMaster = P(R.identity,R.append)
  const onSlave = e=>list=>R.over(lensLast(list),changeLast(e),list)
  const tr = headSplitter(isMaster,onMaster,onSlave)
  return tr([HeadList.emptyList()],data)
}
class Print {
  static arr(tag,arr){
    return arr.forEach((e,i)=>log([tag,i].join(' '))(e))
  }
  static get funcReplace() {return pipelog('FUNC')(R.when(P(R.last,R.is(Function)),e=>[e[0],'FUNC']))}
  static get pair(){
    return P(R.toPairs,R.map(Print.funcReplace()))}
  static to(func) {return P(S.maybeToNullable,func)}
  static get typeOrOper() {return R.ifElse(P(propType,R.equals('operator')),propVal,propType)}
}
log('example')(exampleTrans)
let justData = stringTokenTransform(exampleTrans)
let noDefData = stringTokenTransform(exampleNoDef)
Print.arr('toPrint',R.map(Print.to(Print.pair))(justData))
Print.arr('filtered',filterMs(isTokenCat(typeCats.control))(justData))

const replacer = (type,value)=>e=>{
  e.value = value
  e.type = type
  return e
}
const checkReplace = (checker,modificator)=>R.map(R.when(checker,modificator))
const replaceSlash = checkReplace(checkToken.dash,replacer(types.Any,R.__))//R.map(R.when(checkToken.dash,replacer))
const checkRepList = [[checkToken.dash,types.R,R.__]]
const detectAtomic = R.when(P(propHead,isTokenCat(types.R)),Lexeme.AtomicFunc)

//const detectPipes = R.when(P(propHead,pipeSymbols),Lexeme.Pipe)

let atomicList = R.map(P(e=>new HeadList(e),detectAtomic))(intoAtomics(S.lift(replaceSlash)(justData)))
let pipedList = intoPipes(atomicList)
Print.arr('atomicList',R.map(Print.funcReplace(),atomicList))
Print.arr('pipedList',pipedList)
//Print.arr('stageHead noDef',R.map(Print.funcReplace(),leftRights(stageHeader(noDefData))))


module.exports = log