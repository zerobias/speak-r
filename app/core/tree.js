const R = require('ramda')

const util = require('../util')
const S = util.S

const P = util.P
const RP = util.RP
const log = util.log('tree')
const pipelog = util.pipelog('tree')
const prop = util.prop

const Lexeme = require('../model/lexeme')
const HeadList = require('../model/head-list')

const types = require('../lang/syntax').types
const tool = require('../lang/tooling')
const eq = tool.equals
const Print = require('../print')

const tapArr = tag=> R.tap(e=>e.map((o,i)=>pipelog(tag+' '+i)(o)))
// const example = "tokens :: Array prop 'type' indexOf _ 'tokens' equals -1 not"
// const exampleNoDef = "prop 'type' indexOf _ 'tokens' equals -1 not"
//const onChecking = P(  R.prepend(  R.take(2) , R.equals('|>') ) , R.apply(R.ifElse) )
//const __tranducer = P(R.ifElse(P(R.prop('value'),R.propEq('type','R')),P(R.prop('value'),R.of,R.append)),R.map)
// const exampleTrans = "ifElse <| prop 'value' propEq 'type' 'R' <|> prop 'value' of append |> map" // _ identity

// const isTokenCat = tokenArray=>P(prop.type,util.isContainOrEq(tokenArray))

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

  const split = {
    context:eiSplitOn(eq.op.doubledots),
    define:eiSplitOn(eq.op.define)
  }
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
  let res = P(split.define,writeField('define',props),split.context,writeField('context',props))
  props.data = res(data)
  return props
}

function headSplitter(isMaster,onMaster,changeLast) {
  const lensLast = RP().length.dec.lensIndex.run
  const onEmpty = e=>R.append(Lexeme.Pipe(new HeadList([e])))
  const onSlave =
    e=>list=>
        R.ifElse(
          R.isEmpty,
          onEmpty(e),
          R.over(
            lensLast(list),
            changeLast(e)
          ))(list)
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
const taplog = tag=>R.tap(e=>Print.headList(tag,e,-1))
function lexemize(data) {
  const detectAtomic = R.when(P(prop.head,eq.type.R.context),Lexeme.AtomicFunc)
  const detectExpr   = R.when(P(prop.head,eq.type.op),Lexeme.Expression)
  const detecting = P(
    e=>new HeadList(e),
    detectAtomic,
    detectExpr,taplog('detectExpr ')
    )
  const lexemizing = P(
    S.lift(checkReplace),tapArr('checkReplace'),
    intoAtomics,pipelog('intoAtomics'),
    R.map(detecting))
  return lexemizing(data)
}
function addArgName(data) {
  const morph = e=>R.when(eq.type.arg.context,R.assoc('argName',e.value))(e)
  const apply = e=>S.Right(morph).ap(e)
  return R.map(apply,data)
}
function getSyntaxTree(data) {
  const treePipe = P(
    indexation,tapArr('indexation'),
    addArgName,tapArr('argName'),
    eitherToMaybe,
    lexemize,//tapArr('lexemize'),
    intoPipes
    )
  const setTree = P(stageHeader,e=>R.assoc('tree',treePipe(e.data),e))
  return setTree(data)
}

module.exports = getSyntaxTree


// var ex = `marked handler defObj :: if <== is Array <- [^] <| propOr @defObj 'value' assoc 'mark' @marked ] <- handler 'notList'`


// function listMark(marked, handler, defObj) {
//   return function(data) {
//     var result
//     if (R.is(Array,data)) {
//       result = data.map(function(e){
//         var prop = e.value || defObj
//         prop.mark = marked
//         return prop
//       })
//     } else {
//       result = handler('notList',data)
//     }
//     return result
//   }
// }