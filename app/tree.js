const R = require('ramda')
const S = require('sanctuary')
//const M = require('monet')

const util = require('./util')

const log = util.log('tree')
const pipelog = util.pipelog('tree')

const token = require('./token.js')
const syntax = require('./syntax.js')

const exec = require('./index.js')

const exm = [
  "* repeat _ 2 , fromPairs ",
  "'tokenArray' |> prop 'type' indexOf _ 'tokenArray' != -1",
  "propEq 'type', ifElse => isNil true propEq 'value' of append @ allPass",
  "prepend => take 2 equals '|>' , @ ifElse indexOf _"
]
const op = syntax.op
const example = "tokens :: Array prop 'type' indexOf _ 'tokens' equals -1 not"
const onChecking = R.pipe(  R.prepend(  R.take(2) , R.equals('|>') ) , R.apply(R.ifElse) )

const types = R.pipe(R.map(R.repeat(R.__,2)),R.fromPairs)(syntax.types)
const ofType = typename=>R.propEq('type',typename)
const ofTypeOp=ofType(types.operator)
const ofVal = R.propEq('value')
const isTokenCat = tokenArray=>R.pipe(R.prop('type'),R.indexOf(R.__,tokenArray),R.equals(-1),R.not)
const propType = R.prop('type')
const propVal = R.prop('value')

const applyM = func=>S.lift(func)


const isToken = (tokenPred,typePred) => R.allPass([typePred?ofType:ofTypeOp, ofVal(tokenPred)])
const checkToken = {
  comma:isToken(op.comma),
  doubledots:isToken(op.doubledots),
  arrow:isToken(op.arrow),
  dash:isToken(op.dash)
}
function stringTokenTransform(data) {
  const tokenGetter = S.fromMaybe(token.Any(null))
  const indexPipe = (e,i)=>R.pipe(tokenGetter,R.assoc('index',i),S.toMaybe)(e)
  const indexation = list=>list.map(indexPipe)
  return R.pipe(exec,R.map(S.eitherToMaybe),indexation)(data)
}



//const apToList = S.T(justData)

const filter = func=>R.filter(e=>e.filter(func).isJust)

const maybeIndex = R.ifElse(R.gte(0),S.Maybe.empty,S.Maybe.of)
const scanPipe = R.pipe(checkToken.comma,R.findIndex,maybeIndex)

const typeCats = {
  piped:[types.R,types.context],
  inserted:[types.number,types.string,types.type,types.any],
  control:[types.operator]
}

const mValueComp = (val,field)=>data=>S.Maybe.of(R.propEq(R.defaultTo('value',field),val)).ap(data).value
const isOpenS = mValueComp('<-')
const isCloseS = mValueComp(',')

const mapFilter = func=>R.map(e=>e.filter(func))
const operFilter = opers=>R.pipe(mapFilter(ofType(types.operator)),mapFilter(R.anyPass(R.map(ofVal,opers))),S.justs)

const balanceReducer = (isOpen,isClose)=>arr=> {
  if (!R.is(Array,arr)) return S.Left('No array recieved')
  let i = 0
  var stack = []
  var result = []
  while(i<arr.length) {
    if (isOpen(arr[i]))
      stack.push(i)
    else if (isClose(arr[i]))
      result.push([stack.pop(),i])
    i++
  }
  return S.Right({
    opened:stack,
    pairs:result
  })
}
class LexemeType {
  static Pipe(obj) {
    return new LexemeType('Pipe',obj)
  }
  static AtomicFunc(obj) {
    return new LexemeType('AtomicFunc',obj)
  }
  static Context(obj) {
    return new LexemeType('Context',obj)
  }
  constructor(typename,obj) {
    this.lexeme = typename
    this.index = obj.index
    this.by = obj.value
  }
}
class HeadList {
  constructor(rawList, head) {
    if (!R.is(Array,rawList)||rawList.length==0) return S.Left('No array recieved')
    if (R.isNil(head)) {
      this.head = R.head(rawList)
      this.tail = R.tail(rawList)
    } else {
      this.head = head
      this.tail = rawList
    }
  }
  map(func) {
    return R.map(func,this.tail)
  }
}

const unJustNested = R.map(S.justs)

const selectRange = (startInd,endInd)=>data=>data.map(R.reject(e=>e.index<startInd&&e.index>endInd))
// let mList = M.List.fromArray(data)
function stageHeader(data) {
  let results = operFilter(['::'])(data)
  const range = (min,max)=>R.map(R.reject(e=>e.value.index>max||e.value.index<min),data)
  const split = R.splitWhen(e=>applyM(checkToken.doubledots)(e).value)
  return split(data)
}

class Print {
  static arr(tag,arr){
    return arr.forEach((e,i)=>log([tag,i].join(' '))(e))
  }
  static get funcReplace() {return pipelog('FUNC')(R.when(R.pipe(R.last,R.is(Function)),e=>[e[0],'FUNC']))}
  static get pair(){
    return R.pipe(R.toPairs,R.map(Print.funcReplace()))}
  static to(func) {return R.pipe(S.maybeToNullable,func)}
  static get typeOrOper() {return R.ifElse(R.pipe(propType,R.equals('operator')),propVal,propType)}
}
log('example')(example)
let justData = stringTokenTransform(example)
Print.arr('toPrint',R.map(Print.to(Print.pair))(justData))
Print.arr('filtered',filter(isTokenCat(typeCats.control))(justData))
log('balance')(balanceReducer(isOpenS,isCloseS)(justData).value)

Print.arr('stageHeader',R.map(Print.funcReplace(),unJustNested(stageHeader(justData))))
log('filter')(operFilter(['<-',',','=>'])(justData))


module.exports = log