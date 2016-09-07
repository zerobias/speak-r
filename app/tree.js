const R = require('ramda')
const S = require('sanctuary')

const util = require('./util')

const P = util.P
const log = util.log('tree')
const pipelog = util.pipelog('tree')

const token = require('./token.js')
const syntax = require('./syntax.js')
const Lexeme = require('./lexeme.js')

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

const types = P(R.map(R.repeat(R.__,2)),R.fromPairs)(syntax.types)
const ofType = typename=>R.propEq('type',typename)
const ofTypeOp=ofType(types.operator)
const ofVal = R.propEq('value')
const isTokenCat = tokenArray=>P(R.prop('type'),R.indexOf(R.__,tokenArray),R.equals(-1),R.not)
const propType = R.prop('type')
const propVal = R.prop('value')

const applyM = func=>S.lift(func)
const filterM = func=>e=>e.filter(func)
const filterMs = func=>P(R.map(filterM(func)),S.justs)
const indexOf = e => e.isJust ? e.value.index : NaN
const rangeMs = (min,max)=>R.map(R.reject(e=>indexOf(e)>max||indexOf(e)<min))
const filter = func=>R.filter(e=>filterM(func)(e).isJust)

const isToken = (tokenPred,typePred) => R.allPass([typePred?ofType:ofTypeOp, ofVal(tokenPred)]) //TODO fix possible bug: seems like ofType needs type arg
const checkToken = {
  comma:isToken(op.comma),
  doubledots:isToken(op.doubledots),
  arrow:isToken(op.arrow),
  dash:isToken(op.dash)
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

const mapFilter = func=>R.map(filterM(func))
const operFilter = opers=>P(mapFilter(ofType(types.operator)),mapFilter(R.anyPass(R.map(ofVal,opers))),S.justs)

const unJustNested = R.map(S.justs)
const leftRights = S.either(R.of,unJustNested)
function stageHeader(data) {
  //let results = operFilter(['::'])(data)
  const errorFabric = text=>()=>S.Left(text)
  const err = R.map(errorFabric,{
    nothing:'Nothing finded',
    many:'Find more than one ::',
    other:'Undefined error'
  })
  // const split = R.splitWhen(e=>filterM(checkToken.doubledots)(e).value)
  const splitAt = R.flip(R.splitAt)(data)
  const findDD = filterMs(checkToken.doubledots)
  const split = P(R.head,R.prop('index'),splitAt,S.Right)
  const indexChanger = index=>R.over(R.lensIndex(index))
  const overHead = indexChanger(0)
  const overBody = indexChanger(1)
  const headChange = P(filterMs(ofType(types.context)),R.map(Lexeme.Context),R.map(S.Maybe.of))
  const headContextMounter = S.either(S.Left,P(overHead(headChange),overBody(R.tail),pipelog(`over`),S.Right))
  const cond = R.cond([
    [R.isEmpty,err.nothing],
    [e=>R.gt(R.length(e),1),err.many],
    [e=>R.equals(R.length(e),1),split],
    [R.T,err.other]
  ])

  return P(findDD,cond,headContextMounter)(data)
}
function intoPipes(data) {
  const changeLast = e=>P(util.arrayify,R.append(e.value))
  const lensLast = P(R.length,R.dec,R.lensIndex)
  const isMaster = P(e=>e.value,ofType(types.R))
  const onMaster = P(e=>e.value,R.of,R.append)
  const onSlave = e=>list=>R.over(lensLast(list),changeLast(e),list)
  const tranducer = R.map(R.ifElse(isMaster,onMaster,onSlave))
  const tr = R.transduce(tranducer,(acc,val)=>val(acc), [])
  return tr(data)
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
log('example')(example)
let justData = stringTokenTransform(example)
let noDefData = stringTokenTransform(exampleNoDef)
Print.arr('toPrint',R.map(Print.to(Print.pair))(justData))
Print.arr('filtered',filter(isTokenCat(typeCats.control))(justData))


Print.arr('stageHeader',R.map(Print.funcReplace(),intoPipes(stageHeader(justData).value[1])))
Print.arr('stageHead noDef',R.map(Print.funcReplace(),leftRights(stageHeader(noDefData))))
log('filter')(operFilter(['<-',',','=>'])(justData))


module.exports = log