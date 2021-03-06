(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('ramda'), require('debug'), require('sanctuary')) :
	typeof define === 'function' && define.amd ? define(['ramda', 'debug', 'sanctuary'], factory) :
	(global.speaker = factory(global.R,global.debug,global.sanctuary));
}(this, (function (require$$0,debug,sanctuary) { 'use strict';

require$$0 = 'default' in require$$0 ? require$$0['default'] : require$$0;
debug = 'default' in debug ? debug['default'] : debug;
sanctuary = 'default' in sanctuary ? sanctuary['default'] : sanctuary;

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var syntax = createCommonjsModule(function (module) {
const op = {
  doubledots:'::',
  comma:',',
  dash:'_',
  arrow:'->',
  doublearrow:'=>',
  middlepipe:'<|>',
  backpipe:'<|',
  forwardpipe: '|>',
  equals:'==',
  plus:'+',
  minus:'-',
  map:'[^]',
  define:':='
}
const types = {
  type:'type',
  R:'R',
  string:'string',
  number:'number',
  op:'operator',
  any:'any',
  context:'context',
  lex:'lexeme',
  F:'contextF',
  arg:'argument'
}
const jstypes = [
  ['Array', Array],
  ['Number', Number],
  ['String', String],
  ['Function', Function],
  ['Object', Object],
  ['Null', null],
  ['RegExp', RegExp]]
const quotes = ['"',"'",'`']
const categories = {
  piped:[types.R,types.context,types.lex],
  inserted:[types.number,types.string,types.type,types.any],
  control:[types.op]
}
const lexemeTypes = {
  pipe:'Pipe',
  context:'Context',
  atomic:'AtomicFunc',
  expr:'Expression',
  arg:'Argument'
}
module.exports = {op,types,quotes,categories,jstypes,lexemeTypes}
});

var token = createCommonjsModule(function (module) {
const R = require$$0
const types = syntax.types
const TokenFabric = R.curry((category,obj)=>{
  return {
    type:category,
    value:obj
  }
})
module.exports = R.map(e=>TokenFabric(types[e]),{
  Type      :'type',
  R         :'R',
  String    :'string',
  Number    :'number',
  Operator  :'op',
  Any       :'any',
  Context   :'context',
  Arg       :'arg'
})
});

var ramdaPiped = createCommonjsModule(function (module) {
const R = require$$0
const def = (func,obj)=>prop=>
  Object.defineProperty(obj,prop[0],{
    get:function(){
      func(prop[1])
      return obj}})
const appender = _store=>val=>_store.push(val)
const setter = (store,ins,dict)=> R.pipe(R.toPairs,R.forEach(def(appender(store),ins)))(dict)
function polymorph(store) {
  return function ins(...val) {
    store.push(store.pop()(...val))
    return ins
  }
}
function storage(dict) {
  var store = []
  var ins = polymorph(store)
  Object.defineProperty(ins,'store',{get:function(){return store}})
  Object.defineProperty(ins,'run',{get: function() {return R.pipe(...store)}})
  setter(store,ins,dict)
  return ins
}
const RP = {}
Object.defineProperty(RP,'do',{get:function(){return storage(R)}})
module.exports = ()=>RP.do
});

var pipefy = createCommonjsModule(function (module) {
const R = require$$0
const red = func => R.reduce(func,[])
const reducer = red(logic)
const ifArr = R.pipe(
  R.flatten,
  reducer,
  R.flip(R.concat)
)
function logic(acc,val) {
  if (R.is(Array)(val))
    return ifArr(val)(acc)
  else
    return R.append(val,acc)
}
function P(...data) {
  let actionList = reducer(data)
  return R.pipe(...actionList)
}
module.exports = P
});

var util = createCommonjsModule(function (module) {
const R = require$$0
const debug$$1 = debug
const RP = ramdaPiped
const pipefy$$1 = pipefy
const P = pipefy$$1
const isof = {
  String: R.is(String),
  Func:   R.is(Function),
  Array:  R.is(Array),
  Nil:    R.isNil,
  Real:   e=>!R.isNil(e),
  Empty:  R.isEmpty,
  Full:   e=>!R.isEmpty(e)
}
const tagvalue = (tag,mess)=>isof.Nil(mess) ? tag : [tag,mess].join(':  ')
const log = tag=>mess=>debug$$1(tagvalue(tag,mess))
const pipelog = tag=>mess=>R.tap(log(tag)(mess))
const arrayify = R.pipe(R.defaultTo([]),R.unless(isof.Array,R.of))
const isContainOrEq = P(arrayify,R.flip(R.contains))
const {create, env} = sanctuary
const checkTypes = false
const S = create({checkTypes: checkTypes, env: env})
const prop = R.map(R.prop,{
  type: 'type',
  val:  'value',
  head: 'head',
  tail: 'tail',
  data: 'data'
})
const isString = isof.String
module.exports = {
  pipelog,log,isString,arrayify,P,isof,isContainOrEq,prop,RP,S
}
});

var fabric = createCommonjsModule(function (module) {
const R = require$$0
const syntax$$1 = syntax
const Token = token
const util$$1 = util
const S = util$$1.S
const P = util$$1.P
const isString = util$$1.isString
function TokenFabric(tokenType, condition, transformation) {
  const onCondition = P(util$$1.arrayify, R.allPass, S.either(R.__, R.F))
  const appendArray = R.flip(R.concat)
  const addSteps = appendArray([tokenType, S.Right])
  const transformUntouched = P(
    util$$1.arrayify,
    addSteps,
    P,
    e=>S.either(e, R.identity))
  return R.when(onCondition(condition), transformUntouched(transformation))
}
const quoteProcessor = function () {
  const isQuote = R.anyPass(R.map(R.equals, syntax$$1.quotes))
  const isQuoted = R.allPass([P(R.head, isQuote), P(R.last, isQuote)])
  const removeQuotes = P(R.init, R.tail)
  return TokenFabric(Token.String, [isString, isQuoted], [R.trim, removeQuotes])
}
const typesProcessor = () => {
  const types = new Map(syntax$$1.jstypes)
  const isInMap = obj => isString(obj) ? types.has(obj) : false
  return TokenFabric(Token.Type, isInMap, e => types.get(e))
}
const isNumber = TokenFabric(Token.Number, isFinite, parseFloat)
const vendorProcessor = () => {
  const isFunc = R.is(Function)
  const isRamda = obj => isFunc(R[obj])
  return TokenFabric(Token.R, [isString, isRamda], R.prop(R.__, R))
}
const contextValidation = str => P(R.match(/\D\w+/), R.head, R.equals(str))(str)
const isContext = TokenFabric(Token.Context, contextValidation)
const argValidation = R.both(P(R.head,R.equals('@')),P(R.tail,contextValidation))
const isArg = TokenFabric(Token.Arg, argValidation, R.tail)
const preprocess = S.lift(R.when(isString, R.trim))
const postprocess = R.identity
module.exports = {
  isQuote: quoteProcessor(),
  isType: typesProcessor(),
  isVendor: vendorProcessor(),
  isNumber,
  isContext,
  isArg,
  preprocess,
  postprocess
}
});

var splitter = createCommonjsModule(function (module) {
const R = require$$0
const util$$1 = util
const P = util$$1.P
const Token = token
const log = util$$1.pipelog('splitter')
const operators = R.values(syntax.op)
const stringMorpher = morph=>R.map(R.when(util$$1.isof.String,morph))
const stringTrim = stringMorpher(R.trim)
const rejectEmpty = R.reject(R.isEmpty)
const opersFuncs = [
  R.split,
  P(Token.Operator,R.intersperse)
]
const constFuncs = [
  rejectEmpty,
  R.unnest
]
const splitCond = symb=>R.cond([
  [util$$1.isof.String,symb],
  [R.T,log('uncaught')]
])
const unnester = symbPipe=>P(
  symbPipe,
  R.unnest)
const splitsPipe = [
  R.of,
  R.ap(opersFuncs),
  R.concat(R.__,constFuncs),
  P,
  splitCond,
  R.map,
  unnester,
  log('splitPipe')]
const splitter = P(P,R.map(R.__,operators),P)(splitsPipe)
const cleaner = P(R.unnest,stringTrim,rejectEmpty,log('end'))
const execFuncs = [
  util$$1.arrayify,
  splitter,
  cleaner]
const exec = P(execFuncs)
module.exports = {exec,cleaner}
});

var error = createCommonjsModule(function (module) {
const R = require$$0
const util$$1 = util
const isof = util$$1.isof
const P = util$$1.P
function CustomError(message,data) {
  this.name = "CustomError"
  this.message = join.msg([message,data])
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor)
  } else {
    this.stack = (new Error()).stack
  }
}
CustomError.prototype = Object.create(Error.prototype)
CustomError.prototype.constructor = CustomError
const join = {
  msg:R.join(': '),
  newline:R.join('\n'),
  space:R.join(' '),
  clear:R.join(''),
  comma:R.join(', ')
}
const keyValJoint = P(
  R.map(P(
    R.toPairs,
    R.map(join.msg),
    join.comma,
    e=>join.space(['{',e,'}']))),
  join.newline)
const countsMessage = message=>data=>R.ifElse(e=>e.length>1,()=>message+'s',()=>message)(data)
class TokenError extends CustomError {
  static get message() {
    return countsMessage(`unknown token`)
  }
  constructor(data) {
    super(TokenError.message(data), (data))
    this.name = "TokenError"
  }
}
class ArgumentsTypeError extends CustomError {
  static get message() {
    return countsMessage(`call non-function argument`)
  }
  constructor(data) {
    super(ArgumentsTypeError.message(data), keyValJoint(data))
    this.name = "ArgumentsTypeError"
  }
}
class LexicError extends CustomError {
  static get message() {
    return P(
      R.converge(R.of,[R.pluck('error'),R.pluck('data')]),
      R.map(join.comma))
  }
  constructor(data) {
    super(LexicError.message(data), keyValJoint(R.pluck('data',data)))
    this.name = "LexicError"
  }
}
function errorCheck(Err) {
  return function(data) {
    let failed = util$$1.S.lefts(data)
    if (!R.isEmpty(failed))
      throw new Err(failed)
  }
}
CustomError.Throw = {
  Token:errorCheck(TokenError),
  Args:e=>{throw new ArgumentsTypeError(e)},
  Lexic:errorCheck(LexicError)
}
module.exports = CustomError
});

var stringPreprocess = createCommonjsModule(function (module) {
const R = require$$0
const fab = fabric
const splitter$$1 = splitter
const util$$1 = util
const P = util$$1.P
const S = util$$1.S
const Err = error
const pipelog = util$$1.pipelog('preproc')
const singleWordParsing =
  P(
    fab.preprocess,
    pipelog('->isQuote'),
    fab.isQuote,
    pipelog('->isNumber'),
    fab.isNumber,
    pipelog('->isType'),
    fab.isType,
    pipelog('->isVendor'),
    fab.isVendor,
    pipelog('->isArg'),
    fab.isArg,
    pipelog('->isContext'),
    fab.isContext,
    pipelog('->postprocess'),
    fab.postprocess)
function splitKeywords(data) {
  const err = R.unless(util$$1.isString, () => { throw new Error('`keywords` should be String'); })
  const beforeSplit = P(
    err,
    R.split(' '),
    R.reject(R.isEmpty))
  const sSort = R.map(R.ifElse(R.is(Object),S.Right,S.Left))
  const _drops = (a,b)=>R.allPass([
    R.propEq('type','operator'),
    R.propEq('obj',','),
    R.eqProps('obj',R.__,b)
  ])(a)
  const drops = R.dropRepeatsWith(_drops)
  let un = P(
    beforeSplit,
    splitter$$1.exec,
    sSort,
    pipelog('тэг'),
    R.map(singleWordParsing),
    drops
  )
  let splitted = un(data)
  Err.Throw.Token(splitted)
  return splitted
}
module.exports = splitKeywords
});

var headList = createCommonjsModule(function (module) {
const R = require$$0
const util$$1 = util
const S = util$$1.S
const P = util$$1.P
const isof = util$$1.isof
class HeadList {
  constructor(rawData) {
    const list = util$$1.arrayify(rawData)
    this.head = R.head(list) || {}
    this.tail = R.tail(list)
  }
  get toArray() {
    return R.prepend(this.head,this.tail)
  }
  *[Symbol.iterator]() {
    yield this.head
    for (let e of this.tail)
      yield e
  }
  get length() {
    return R.converge(R.add,[
      R.pathOr(0,['tail','length']),
      P(R.prop('head'),R.isNil,e=>e ? 0 : 1)])
  }
  append(e) {
    if (HeadList.isEmpty(this))
      this.head = e
    else
      this.tail.push(e)
    return this
  }
  static create(e) {
    return new HeadList(e)
  }
  static get prepend() {
    return R.curry((val,list)=>{
      list.tail = R.prepend(list.head, list.tail)
      list.head = val
      return list
    })
  }
  static cyclic(func) {
    return function(list) {
      for(let e of list)
        e = P(R.when(
          HeadList.isList,
          HeadList.cyclic(func)),func)(e)
      return list
    }
  }
  static isEmpty(list) {
    return !HeadList.hasTail(list)&&R.isEmpty(list.head)
  }
  static get hasTail() {
    return R.both(R.has('tail'),P(R.prop('tail'),isof.Full))
  }
  static last(list) {
    return HeadList.hasTail(list)
      ? R.last(list.tail)
      : list.head
  }
  static lastR(list,isStrict=false) {
    const _hasTail = R.has('tail')
    const notHas = P(_hasTail,R.not)
    const cond = R.either(notHas,P(HeadList.last,notHas))
    return R.until(isStrict?cond:notHas,HeadList.last)(list)
  }
  static emptyList() {
    return new HeadList()
  }
  static isList(list) {
    return R.has('head',list)
  }
}
module.exports = HeadList
});

var lexeme = createCommonjsModule(function (module) {
const R = require$$0
const lexemeTypes = syntax.lexemeTypes
const HeadList = headList
class ILexeme {
  constructor(typename,obj) {
    obj.index = obj.head.index
    obj.lexeme = typename
    return obj
  }
}
class Lexeme {
  static Pipe(tokensList) {
    return new ILexeme(lexemeTypes.pipe,tokensList)
  }
  static AtomicFunc(tokensHList) {
    return new ILexeme(lexemeTypes.atomic,tokensHList)
  }
  static Expression(tokensHList) {
    return new ILexeme(lexemeTypes.expr,tokensHList)
  }
  static Argument(tokensHList) {
    return new ILexeme(lexemeTypes.arg,tokensHList)
  }
  static get its() {
    const eq = R.propEq('lexeme')
    return R.map(eq,lexemeTypes)
  }
  static Context(token) {
    return new Lexeme(lexemeTypes.context,token)
  }
}
module.exports = Lexeme
});

var tooling = createCommonjsModule(function (module) {
const R = require$$0
const util$$1 = util
const P = util$$1.P
const syntax$$1 = syntax
const types = syntax$$1.types
const op = syntax$$1.op
const checkToken = type=>val=>R.whereEq({type:type,value:val})
const checkOper = checkToken(types.op)
const checkType = R.propEq('type')
const def = (func,obj)=>prop=>
  Object.defineProperty(obj,prop[0],{
    get:function(){
      func(prop[1])
      return obj}})
function polymorph(store) {
  return function ins(val) {
    return R.ifElse(R.either(R.isNil,()=>R.isEmpty(store)),()=>ins, R.anyPass(store))(val)
  }
}
const appender = store=>val=>store.push(val)
const setter = (store,ins,dict)=>P(
  R.toPairs,
  R.forEach(
    def(appender(store),ins)))(dict)
function storage(dict) {
  var store = []
  var ins = polymorph(store)
  Object.defineProperty(ins,'store',{get:function(){return store}})
  setter(store,ins,dict)
  return ins
}
const eq = {
  op:       R.map( checkOper )(op),
  type:     R.map( checkType )(types),
  typedVal: R.map( checkToken )(types)
}
const equals = {}
Object.defineProperty(equals,'op',{get:function(){return storage(eq.op)}})
Object.defineProperty(equals,'type',{get:function(){return storage(eq.type)}})
Object.defineProperty(equals,'typedVal',{get:function(){return storage(eq.typedVal)}})
module.exports = {eq,equals}
});

var print = createCommonjsModule(function (module) {
const R = require$$0
const util$$1 = util
const S = util$$1.S
const P = util$$1.P
const log = util$$1.log('tree')
const HeadList = headList
class Print {
  static _indexTag(tag) {
    return (e,separ=' ')=>P(util$$1.arrayify,R.prepend(tag),R.join(separ),log)(e)
  }
  static arr(tag,arr){
    let iTag = Print._indexTag(tag)
    return arr.forEach((e,i)=>iTag(i)(e))
  }
  static get funcReplace() {return R.when(P(R.last,R.is(Function)),e=>[e[0],'FUNC'])}
  static get pair(){
    return P(R.toPairs,R.map(Print.funcReplace()))}
  static to(func) {return P(S.maybeToNullable,func)}
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
module.exports = Print
});

var doubleLinked = createCommonjsModule(function (module) {
const R = require$$0
const nil = R.isNil
class DoubleLinked {
  constructor(index=0,past=null,next=null) {
    this.past = past
    this.next = next
    this.index = index
    this.lens = R.lensIndex(index)
  }
  get getter() {
    return R.view(this.lens)
  }
  static getter(e,data) {
    return R.view(e.lens,data)
  }
  setNext(next) {
    this.next = next
  }
  get isFirst() {
    return nil(this.past)
  }
  get isLast() {
    return nil(this.next)
  }
  static first() {
    return new DoubleLinked()
  }
}
class DLinkedList {
  constructor(arr) {
    this.source = arr
    this.first = null
    this.last = null
    this.length = 0
  }
  inc() {
    return this.length++
  }
  dec() {
    return this.length--
  }
  static create(arr) {
    let list = new DLinkedList(arr)
    const length = R.length(arr)
    let i=0
    while (i<length) {
      list.inc()
      if (i===0) {
        list.first = DoubleLinked.first()
        list.last = list.first
      } else {
        let e = new DoubleLinked(i,list.last)
        list.last.setNext(e)
        list.last = e
      }
      i++
    }
    return list
  }
  static remove(list,e) {
    if (e.isFirst&&e.isLast) {
      list.first = null
      list.last = null
    } else if (!e.isFirst&&!e.isLast) {
      e.past.next = e.next
      e.next.past = e.past
    } else if (e.isFirst) {
      list.first = e.next
      list.first.past = null
    } else if(e.isLast) {
      list.last = e.past
      list.last.next = null
    }
    list.dec()
  }
  *[Symbol.iterator]() {
    yield this.first
    let next = this.first.next
    while(!nil(next)) {
      yield next
      next = next.next
    }
  }
}
module.exports = DLinkedList
});

var treeError = createCommonjsModule(function (module) {
const R = require$$0
const util$$1 = util
const S = util$$1.S
const P = util$$1.P
const tool = tooling
const eq = tool.equals
const DlinkList = doubleLinked
const Err = error
const chain = func=>e=>e.chain(func)
function testing(rejectFunc) {
  const testPack = tests => P(R.juxt(util$$1.arrayify(tests)),R.all(R.equals(true)))
  const curryTestPack = tests=>e=>data=>testPack(tests)(e,data)
  const over = (_list,morpher)=>node=>R.over(node.lens,morpher(_list,node))
  const onCatch = (tester,overrider)=>node=>R.when(tester(node),overrider(node))
  const checkNode = tester=>morpher=>_list=>{
    const overrider = over(_list,morpher)
    const catcher = onCatch(tester,overrider)
    return (_data,node)=>catcher(node)(_data)
  }
  const testsPipe = P(curryTestPack,checkNode)
  const recompose = (rejectFunc,testlist)=>P(rejectFunc,testsPipe(testlist))
  return (testName,testlist) => recompose(rejectFunc,testlist)(testName)
}
function prepareValidation(testKit) {
  const leftErrorGen = errorText=>o=>S.Left({error:errorText,data:o})
  const errorGen = rejectFunc=>P(leftErrorGen,chain,rejectFunc)
  const changeRejected = (onError)=>(_list,listNode)=>e=>{
    DlinkList.remove(_list,listNode)
    return onError(e)
  }
  const testingFactory = P(errorGen,testing)(changeRejected)
  const testingRun = P(R.toPairs,R.map(e=>testingFactory(...e)),P)
  return testingRun(testKit)
}
function iterduce(testFunc) {
  return function(data) {
    let list = DlinkList.create(data)
    return errorSummary(R.reduce(testFunc(list),data,list))
  }
}
function errorSummary(data) {
  Err.Throw.Lexic(data)
  return S.rights(data)
}
const isInsertCatTest = (e,_data)=>e.getter(_data).chain(eq.type.number.string.type.any.arg)
const siblingTest = (e,_data)=>e.isFirst
const testKit = {
  siblingFilter:[isInsertCatTest,siblingTest]
}
let project = prepareValidation(testKit)
module.exports = iterduce(project)
});

var tree = createCommonjsModule(function (module) {
const R = require$$0
const util$$1 = util
const S = util$$1.S
const P = util$$1.P
const RP = util$$1.RP
const log = util$$1.log('tree')
const pipelog = util$$1.pipelog('tree')
const prop = util$$1.prop
const Lexeme = lexeme
const HeadList = headList
const types = syntax.types
const tool = tooling
const eq = tool.equals
const Print = print
const findErrors = treeError
const leftRight = o=>o.isRight?'R':'L'
const tapArr = tag=> R.tap(e=>e.map((o,i)=>pipelog(R.join(' ')([tag,i,leftRight(o)]))(o.value)))
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
function headSplitter(isMaster,onMaster,push) {
  const lensLast = RP().length.dec.lensIndex.run
  const onEmpty = P(HeadList.create,Lexeme.Pipe,R.append)
  const onSlave =
    e=>list=>
        R.ifElse(
          R.isEmpty,
          onEmpty(e),
          R.over(
            lensLast(list),
            push(e)
          ))(list)
  const tranducer = R.map(R.ifElse(isMaster,onMaster,onSlave))
  return R.transduce(tranducer,(acc,val)=>val(acc))
}
function intoAtomics(data) {
  const push = e=>P(util$$1.arrayify,R.append(e.value))
  const isMaster = P(prop.val,eq.type.R.op.context)
  const onMaster = P(prop.val,R.of,R.append)
  const tr = headSplitter(isMaster,onMaster,push)
  return tr([],data)
}
function intoPipes(data) {
  const push = e=>hList=>hList.append(e)
  const pipeSymbols = eq.op
    .forwardpipe
    .middlepipe
    .backpipe
  const isMaster = R.both(HeadList.isList,P(prop.head, pipeSymbols))
  const onMaster = P(R.identity,R.append)
  const tr = headSplitter(isMaster,onMaster,push)
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
  const reducer = (acc,val)=>doCheckReplace(...val)(acc)
  return R.reduce(reducer,data,replacers)
}
const toMaybes = R.map(S.Maybe.of)
const taplog = tag=>R.tap(e=>Print.headList(tag,e,-1))
function lexemize(data) {
  const whenHeadIsDo = (cond,action)=>R.when(P(prop.head,cond),action)
  const detectAtomic = whenHeadIsDo(eq.type.R.context , Lexeme.AtomicFunc)
  const detectExpr   = whenHeadIsDo(eq.type.op , Lexeme.Expression)
  const detecting = P(
    HeadList.create,
    detectExpr,taplog('detectExpr'),
    detectAtomic,taplog('detectAtomic')
    )
  const lexemizing = P(
    S.lift(checkReplace),tapArr('checkRepl'),
    findErrors,tapArr('findErrors'),
    toMaybes,
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
    indexation,tapArr('indexate '),
    addArgName,tapArr('argName  '),
    lexemize,
    intoPipes
    )
  const setTree = P(stageHeader,e=>R.assoc('tree',treePipe(e.data),e))
  return setTree(data)
}
module.exports = getSyntaxTree
});

var stack = createCommonjsModule(function (module) {
const R = require$$0
const HeadList = headList
function Stack() {
  const appendTo = obj=>e=>obj.append(e)
  this.value = []
  this.push = obj=>this.value.push(appendTo(obj))
  this.pushLast = result=>this.push(HeadList.lastR(result,true))
  this.pop = ()=>this.value.pop()
  this.addToLast = val=>R.last(this.value)(val)
}
module.exports = ()=>new Stack()
});

var convolve = createCommonjsModule(function (module) {
const R = require$$0
const util$$1 = util
const S = util$$1.S
const P = util$$1.P
const log = util$$1.log('tree')
const pipelog = util$$1.pipelog('tree')
const HeadList = headList
const Stack = stack
const Lexeme = lexeme
const tool = tooling
const eqOp = tool.eq.op
const stateNames = ['pipe','open','mid','close']
const states = {
  empty:0,
  pipe:1,
  open:2,
  mid:3,
  close:4
}
const actions = {
  next:0,
  child:1,
  parent:-1,
  error:NaN
}
const opCond = opVal => R.both(Lexeme.its.expr, P(util$$1.prop.head,opVal))
const stateConds = {
  pipe:Lexeme.its.pipe,
  open:opCond(eqOp.backpipe),
  mid:opCond(eqOp.middlepipe),
  close:opCond(eqOp.forwardpipe)
}
const stConds = R.cond(R.append([R.T,states.pipe],R.map(e=>[stateConds[e],()=>states[e]],stateNames)))
const switches = [
  [NaN,1,1,NaN,1],
  [NaN,0,1,NaN,0],
  [NaN,-1,1,0,-1],
  [NaN,-1,1,0,-1],
  [NaN,0,1,NaN,0]
]
function optimise(data) {
  const exprToPipe = R.when(Lexeme.its.expr,P(util$$1.prop.tail,HeadList.create, Lexeme.Pipe))
  const singlePipeToAtomic = R.when(R.both(Lexeme.its.pipe,P(HeadList.hasTail,R.not)),util$$1.prop.head)
  return P(exprToPipe,singlePipeToAtomic)(data)
}
function convolve(dataPack) {
  let data = dataPack.tree
  if (!R.is(Array,data)) return S.Left('No array recieved')
  let result = HeadList.emptyList()
  let stack$$1 = Stack()
  let state = states.empty
  let i = 0,
      len = data.length
  while(i<len) {
    let e = data[i++]
    let nextState = stConds(e)
    let doAction = switches[state][nextState]
    switch(doAction) {
      case actions.child:
        stack$$1.pushLast(result)
        break
      case actions.parent:
        stack$$1.pop()
        break
    }
    state = nextState
    stack$$1.addToLast(optimise(e))
  }
  dataPack.tree = P(Lexeme.Pipe,optimise)(result)
  return dataPack
}
module.exports = convolve
});

var outfall = createCommonjsModule(function (module) {
const util$$1 = util
const R = require$$0
const P = util$$1.P
const log = util$$1.pipelog('tree')
const pipelog = util$$1.pipelog('tree')
function Outfall() {
  this.id = Math.round(Math.random() * 10e5)
  this.updated = false
  this._data = null
}
Object.defineProperty(Outfall, 'gate', { get: function () { return new Outfall() } })
Object.defineProperty(Outfall.prototype, 'pipe', {
  get: function () {
    let self = this
    return function (data) {
      self.updated = true
      self._data = data
      return data[0]
    }
  }
})
Outfall.prototype.Spout = function (index,isArg = true) {
  return Spout(this, index, isArg)
}
function Spout(parent, index,isArg) {
  let spout = Object.create(parent, {
    data: { get: function () { return parent._data }, enumerable: true },
    index: { get: function() { return index }, enumerable: true },
    id: { get: function () { return parent.id }, enumerable: true },
    isArg: { value: isArg, enumerable: true }
  })
  Object.defineProperty(spout, 'pipe', { value:
    function () {
      log('spout pipe')(spout.data[spout.index],spout)
      if(R.isNil(spout.data)) return null
      return spout.isArg
        ? spout.data[spout.index]
        : spout.data[spout.index] },
    enumerable: true })
  return spout
}
module.exports = Outfall
});

var context = createCommonjsModule(function (module) {
const R = require$$0
const util$$1 = util
const P = util$$1.P
const S = util$$1.S
const log = util$$1.log('tree')
const pipelog = util$$1.pipelog('tree')
const prop = util$$1.prop
const eq = tooling.equals
const HeadList = headList
const types = syntax.types
const Lexeme = lexeme
const Err = error
const chain = func=>o=>o.chain(func)
class IndexMap {
  static get indexation() {
    return R.addIndex(R.map)((e,i)=>R.pair(e.value,i))
  }
  constructor(context) {
    let arr = IndexMap.indexation(context)
    log('index map')(arr)
    this._map = new Map(arr)
  }
  get has() {
    let self = this._map
    return function(e){return self.has(e)}
  }
  get get() {
    let self = this._map
    return function(e){return self.get(e)}
  }
  get hasVal() {
    let has = this.has
    return P(prop.val,has)
  }
}
const errorCheck = R.unless(R.isEmpty,Err.Throw.Args)
const callNotFunc = (token,userArg) => eq.type.context(token)&&!R.is(Function,userArg)
function fillUserData(userData,dataPack) {
  let indexMap = new IndexMap(dataPack.context||[])
  const isArgOrCont = eq.type.arg.context
  const morpher = HeadList.cyclic(modify)
  let errors = new Set()
  dataPack.tree = morpher(dataPack.tree)
  function modify(e) {
    if (!isArgOrCont(e)) return e
    log('ee')(e,isArgOrCont(e))
    if (!indexMap.hasVal(e))
      log('ERRRROR!')(e)
    let argIndex = indexMap.get(e.value)
    let getArg = userData[argIndex]
    if (callNotFunc(e,getArg))
      errors.add({argument:e.value,value:getArg})
    log('refs')(e.type,e.value,argIndex,getArg)
    e.value = getArg
    return e
  }
  errorCheck([...errors.values()])
  return dataPack
}
module.exports = {fillUserData}
});

var say = createCommonjsModule(function (module) {
const R = require$$0
const HeadList = headList
const Lexeme = lexeme
const util$$1 = util
const P = util$$1.P
const pipelog = util$$1.pipelog('tree')
const Outfall = outfall
const eq = tooling.equals
const Context = context
function CompileException(obj) {
  this.message = `Can not compile object ${obj}`
  this.name = "Compile exeption"
}
function collectData(obj) {
  const collect = R.cond([
    [R.is(Array),sayPipe],
    [Lexeme.its.pipe,sayPipe],
    [Lexeme.its.atomic,sayAtomic],
    [P(HeadList.isList,R.not),util$$1.prop.val],
    [R.T,e=>{throw new CompileException(e)}]
  ])
  return collect(obj)
}
function sayPipe(list) {
  const normalize = R.when(HeadList.isList,R.prop('toArray'))
  return P(normalize,R.map(collectData),R.apply(R.pipe))(list)
}
function sayAtomic(list) {
  const applyTailToHead =
    ()=>R.apply(
      collectData(list.head),
      R.map(collectData,list.tail))
  return HeadList.hasTail(list)
    ? applyTailToHead()
    : collectData(list.head)
}
const contextArgs = P(
  R.when(R.equals(false),()=>[]),
  R.when(
    util$$1.isof.Empty,
    R.append({type:'fakeContext',value:'data'})),
  R.map(util$$1.prop.val))
function Runner (dataPack) {
  let obj = function(...userArgs) {
    dataPack.gate.pipe(userArgs)
    let filled = Context.fillUserData(userArgs,dataPack)
    let render = collectData(filled.tree)
    return render(...userArgs)
  }
  Object.defineProperty(obj,'data',{
    value:dataPack
  })
  Object.defineProperty(obj,'source',{get:
    function() { return obj.data.source }
  })
  Object.defineProperty(obj,'args',{get:
    function() { return contextArgs(obj.data.context) }
  })
  return obj
}
function say(sourceString) {
  return function(dataPack) {
    dataPack.source = sourceString
    dataPack.gate = Outfall.gate
    return new Runner(dataPack)
  }
}
say.sayPipe = sayPipe
say.collectData = collectData
module.exports = say
});

var index = createCommonjsModule(function (module) {
const R = require$$0
const preproc = stringPreprocess
const getTree = tree
const convolve$$1 = convolve
const Speak = say
const util$$1 = util
const P = util$$1.P
const log = util$$1.log('index')
const pipelog = util$$1.pipelog('index')
const Print = print
const taplog = tag=>R.tap(e=>Print.headList(tag,e.tree,-1))
const maptaphead = tag=> R.tap(P(
  R.prop('tree'),
  R.map(e=>Print.headList(tag,e,-1))))
const mapprint = tag => R.tap(R.map(pipelog(tag)))
function say$$1(data) {
  return P(
    preproc,mapprint('preproc')
    ,getTree,maptaphead('getTree')
    ,convolve$$1,taplog('conv')
    ,Speak(data)
    )(data)
}
const pureExample = "indexes data sright :: head prop 'index' concat @data append 42 sright"
const simple = "when [ == 1 not , + 10 ] + 100"
log('example')(pureExample)
let word = say$$1(pureExample)
let indexes = [{index:[1,3]},{index:[0,1,2,3]},0]
let dat = [0,5,20,30,40,50]
let sright = R.objOf('result')
let res = word(indexes,dat,sright)
log('res')(res)
module.exports = say$$1
});

return index;

})));
//# sourceMappingURL=speak-r.jsnext.js.map
