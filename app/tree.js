const R = require('ramda')
const S = require('sanctuary')

const util = require('./util')

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
// const example = "tokens :: Array prop 'type' indexOf _ 'tokens' equals -1 not"
// const exampleNoDef = "prop 'type' indexOf _ 'tokens' equals -1 not"
//const onChecking = P(  R.prepend(  R.take(2) , R.equals('|>') ) , R.apply(R.ifElse) )
//const __tranducer = P(R.ifElse(P(R.prop('value'),R.propEq('type','R')),P(R.prop('value'),R.of,R.append)),R.map)
// const exampleTrans = "ifElse <| prop 'value' propEq 'type' 'R' <|> prop 'value' of append |> map" // _ identity

// const isTokenCat = tokenArray=>P(prop.type,util.isContainOrEq(tokenArray))


// const filterM = func=>e=>e.filter(func)
// const filterMs = func=>P(R.map(filterM(func)),S.justs)
// const indexOf = e => e.isJust ? e.value.index : NaN
// const rangeMs = (min,max)=>R.map(R.reject(e=>indexOf(R.either(R.gt(max),R.lt(min)))))

//TODO make isSymbol and other work through R.whereEq
// const isSymbol = tokenPred => R.allPass([isOperator, propEqVal(tokenPred)])
// const eq.op = R.map(isSymbol,op)

function stringTokenTransform(data) {
  const indexPipe = (e,i)=>S.lift(R.assoc('index',i))(e)
  const indexation = list=>list.map(indexPipe)
  return P(R.map(S.eitherToMaybe),indexation)(data)
}

// function stageHeader(data) {
//   const errorFabric = text=>()=>S.Left(text)
//   const err = R.map(errorFabric,{
//     nothing:'Nothing finded',
//     many:'Find more than one ::',
//     other:'Undefined error'
//   })
//   const findDD = filterMs(eq.op.doubledots)
//   const split = P(R.head,R.prop('index'),R.splitAt(R.__,data),S.Right)
//   const indexChanger = RP.do.lensIndex.over.exec
//   const over = {
//     head:indexChanger(0),
//     body:indexChanger(1)
//   }
//   const headChange = P(filterMs(isTokenCat(types.context)),R.map(P(Lexeme.Context,S.Maybe.of)))
//   const headContextMounter = S.either(S.Left,P(over.head(headChange),over.body(R.tail),S.Right))
//   const cond = R.cond([
//     [R.isEmpty,err.nothing],
//     [e=>R.gt(R.length(e),1),err.many],
//     [e=>R.equals(R.length(e),1),split],
//     [R.T,err.other]
//   ])

//   return P(findDD,cond,headContextMounter)(data)
// }
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
  const detectAtomic = R.when(P(prop.head,eq.type.R),Lexeme.AtomicFunc)
  const detectExpr   = R.when(P(prop.head,eq.type.op),Lexeme.Expression)
  const detecting = P(e=>new HeadList(e),detectAtomic,detectExpr)
  const lexemizing = P(S.lift(checkReplace),intoAtomics,R.map(detecting))
  return lexemizing(data)
}

function getSyntaxTree(data) {
  return P(stringTokenTransform,detectContext,pipelog('lexemize<-'),lexemize,pipelog('intoPipes'),intoPipes)(data)
}

module.exports = getSyntaxTree