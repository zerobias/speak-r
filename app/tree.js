const R = require('ramda')
const S = require('sanctuary')

const util = require('./util')

const P = util.P
const log = util.log('tree')
const pipelog = util.pipelog('tree')

const token = require('./token.js')
const syntax = require('./syntax.js')
const Lexeme = require('./lexeme.js')
const HeadList = require('./head-list.js')

const exec = require('./index.js')

const op = syntax.op
const types = syntax.type.dict
const example = "tokens :: Array prop 'type' indexOf _ 'tokens' equals -1 not"
const exampleNoDef = "prop 'type' indexOf _ 'tokens' equals -1 not"
//const onChecking = P(  R.prepend(  R.take(2) , R.equals('|>') ) , R.apply(R.ifElse) )
//const __tranducer = P(R.ifElse(P(R.prop('value'),R.propEq('type','R')),P(R.prop('value'),R.of,R.append)),R.map)
const exampleTrans = "ifElse <| prop 'value' propEq 'type' 'R' <|> prop 'value' of append |> map _"

const propEqVal = R.propEq('value')
const prop = {
  type:R.prop('type'),
  val:R.prop('value'),
  head:R.prop('head')
}
const isTokenCat = tokenArray=>P(prop.type,util.isContainOrEq(tokenArray))
const isOperator = isTokenCat(types.operator)


const filterM = func=>e=>e.filter(func)
const filterMs = func=>P(R.map(filterM(func)),S.justs)
const indexOf = e => e.isJust ? e.value.index : NaN
const rangeMs = (min,max)=>R.map(R.reject(e=>indexOf(R.either(R.gt(max),R.lt(min)))))

//TODO make isSymbol and other work through R.whereEq
const isSymbol = tokenPred => R.allPass([isOperator, propEqVal(tokenPred)])
const checkSymbol = R.map(isSymbol,op)

function stringTokenTransform(data) {
  const indexPipe = (e,i)=>S.lift(R.assoc('index',i))(e)
  const toStrPipe = (e,i)=>S.lift(o=>Object.defineProperty(o,'toString',{value:function(){return `this \n${this.value}`}}))(e)
  const indexation = list=>list.map(indexPipe)
  return P(exec,R.map(S.eitherToMaybe),indexation,list=>list.map(toStrPipe))(data)
}

function stageHeader(data) {
  const errorFabric = text=>()=>S.Left(text)
  const err = R.map(errorFabric,{
    nothing:'Nothing finded',
    many:'Find more than one ::',
    other:'Undefined error'
  })
  const findDD = filterMs(checkSymbol.doubledots)
  const split = P(R.head,R.prop('index'),R.splitAt(R.__,data),S.Right)
  const indexChanger = P(R.lensIndex,R.over)
  const over = {
    head:indexChanger(0),
    body:indexChanger(1)
  }
  const headChange = P(filterMs(isTokenCat(types.context)),R.map(P(Lexeme.Context,S.Maybe.of)))
  const headContextMounter = S.either(S.Left,P(over.head(headChange),over.body(R.tail),S.Right))
  const cond = R.cond([
    [R.isEmpty,err.nothing],
    [e=>R.gt(R.length(e),1),err.many],
    [e=>R.equals(R.length(e),1),split],
    [R.T,err.other]
  ])

  return P(findDD,cond,headContextMounter)(data)
}
function headSplitter(isMaster,onMaster,changeLast) {
  const lensLast = P(R.length,R.dec,R.lensIndex)
  const onEmpty = e=>R.append(new HeadList([e]))
  const onSlave = e=>list=>R.ifElse(R.isEmpty,
    onEmpty(e),
    R.over(lensLast(list),changeLast(e)))(list)
  const tranducer = R.map(R.ifElse(isMaster,onMaster,onSlave))
  return R.transduce(tranducer,(acc,val)=>val(acc))
}
function intoAtomics(data) {
  const changeLast = e=>P(util.arrayify,R.append(e.value))
  const isMaster = P(prop.val,isTokenCat([types.R,types.operator,types.context]))
  const onMaster = P(prop.val,R.of,R.append)

  const tr = headSplitter(isMaster,onMaster,changeLast)
  return tr([],data)
}
function intoPipes(data) {
  const changeLast = e=>hList=>hList.append(e)
  const pipeSymbols = R.anyPass([
    checkSymbol.forwardpipe,
    checkSymbol.middlepipe,
    checkSymbol.backpipe])
  const isMaster = R.both(HeadList.isList,P(prop.head, pipeSymbols))
  const onMaster = P(R.identity,R.append)

  const tr = headSplitter(isMaster,onMaster,changeLast)
  return tr([],data)
}

function checkReplace(data) {
  const replacers = [[checkSymbol.dash,types.any,R.__]]

  const replacer = (type,value)=>e=>{
    e.value = value
    e.type = type
    return e
  }
  const doCheckReplace = (checker,type,value)=>R.map(R.when(checker,replacer(type,value)))
  const reducer = (acc,val)=>R.apply(doCheckReplace,val)(acc)
  const doReplaceAll = rules=>data=>R.reduce(reducer,data,rules)
  const replAll = doReplaceAll(replacers)
  return replAll(data)
}

function lexemize(data) {
  const detectAtomic = R.when(P(prop.head,isTokenCat(types.R)),Lexeme.AtomicFunc)
  const detectExpr   = R.when(P(prop.head,isTokenCat(types.operator)),Lexeme.Expression)

  const detecting = P(e=>new HeadList(e),detectAtomic,detectExpr)
  const lexemizing = P(S.lift(checkReplace),intoAtomics,R.map(detecting))
  return lexemizing(data)
}

class Print {
  static _indexTag(tag) {
    return (e,separ=' ')=>P(util.arrayify,R.prepend(tag),R.join(separ),log)(e)
  }
  static arr(tag,arr){
    let iTag = Print._indexTag(tag)
    return arr.forEach((e,i)=>iTag(i)(e))
  }
  static get funcReplace() {return R.when(P(R.last,R.is(Function)),e=>[e[0],'FUNC'])}
  static get pair(){
    return P(R.toPairs,R.map(Print.funcReplace()))}
  static to(func) {return P(S.maybeToNullable,func)}
  static get typeOrOper() {return R.ifElse(isOperator,prop.val,prop.type)}
  static headList(tag,data,index=0,level=0) {
    const iTag = Print._indexTag(tag)
    const padd = '   '
    const joinPadd = P(R.repeat(padd),R.join(''))
    const objKeys = ['value']
    const keyValPrint = padding=>e=>iTag(['  ',joinPadd(level),padding,e[0]],'')(e[1])
    const tokenPrint = keys=>P(R.props(keys),R.zip(keys),R.forEach(keyValPrint(padd)))
    const isRealIndex = i=>i===-1?'#  ':i+1+((i+1)>=10?' ':'  ')
    const nextLevel = R.add(2,level)
    if (HeadList.isList(data)) {
      keyValPrint(isRealIndex(index))([data.lexeme,data.index])
      Print.headList(tag,data.head,-1,nextLevel)
      if (HeadList.hasTail(data))
        data.tail.forEach((e,i)=>Print.headList(tag,e,i,nextLevel))
    } else {
      keyValPrint(isRealIndex(index))([data.type,data.index])
      tokenPrint(objKeys)(data)
    }
  }
}

let justData = stringTokenTransform(exampleTrans)
// let noDefData = stringTokenTransform(exampleNoDef)

let atomicList = lexemize(justData)
let pipedList = intoPipes(atomicList)

log('example')(exampleTrans)
Print.arr('toPrint',R.map(Print.to(Print.pair))(justData))
Print.arr('just',S.justs(justData))
// Print.arr('filtered',filterMs(isTokenCat(syntax.type.cats.control))(justData))

Print.arr('atomicList',atomicList)
Print.arr('pipedList',pipedList)
Print.arr('until',R.map(HeadList.lastR,pipedList))
atomicList.forEach((e,i)=>Print.headList('atomic',e,i))
pipedList.forEach((e,i)=>Print.headList('piped',e,i))
/*const unJustNested = R.map(S.justs)
const leftRights = S.either(R.of,unJustNested)
Print.arr('stageHead noDef',R.map(Print.funcReplace(),leftRights(stageHeader(noDefData))))*/


module.exports = log