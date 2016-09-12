import require$$3 from 'ramda';
import debug from 'debug';
import sanctuary from 'sanctuary';

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
  map:'^'
}
const types = {
  type:'type',
  R:'R',
  string:'string',
  number:'number',
  op:'operator',
  any:'any',
  context:'context',
  lex:'lexeme'
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
  expr:'Expression'
}
module.exports = {op,types,quotes,categories,jstypes,lexemeTypes}
});

var token = createCommonjsModule(function (module) {
const R = require$$3
const TokenFabric = R.curry((category,obj)=>{
  return /*new Token(category,obj)*/{
    type:category,
    value:obj
  }
})
module.exports = {
  Type:     TokenFabric('type'),
  R:        TokenFabric('R'),
  String:   TokenFabric('string'),
  Number:   TokenFabric('number'),
  Operator: TokenFabric('operator'),
  Any:      TokenFabric('any'),
  Context:  TokenFabric('context')
}
});

var ramdaPiped = createCommonjsModule(function (module) {
const R = require$$3
const def = (func,obj)=>prop=>
  Object.defineProperty(obj,prop[0],{
    get:function(){
      func(prop[1])
      return obj}})
const appender = _store=>val=>_store.push(val)
const inputCheck = (argsArr,_store)=>!R.isEmpty(argsArr)&&!R.is(Function,argsArr[0])&&R.none(R.isNil,argsArr)&&!R.isEmpty(_store)
const setter = (store,ins,dict)=> R.pipe(R.toPairs,R.forEach(def(appender(store),ins)))(dict)
function polymorph(store) {
  return function ins(...val) {
    if (inputCheck(val,store)) {
      store.push(R.apply(store.pop())(val))
    }
    return ins
  }
}
function storage(dict) {
  var store = []
  var ins = polymorph(store)
  ins.exec = function() {return R.apply(R.pipe, store)}
  ins.toString = function(){return ''}
  Object.defineProperty(ins,'store',{get:function(){return store}})
  Object.defineProperty(ins,'exec',{get: function() {return R.apply(R.pipe, store)}})
  setter(store,ins,dict)
  return ins
}
const RP = {}
Object.defineProperty(RP,'do',{get:function(){return storage(R)}})
module.exports = RP
});

var util = createCommonjsModule(function (module) {
const R = require$$3
const debug$$1 = debug
const RP = ramdaPiped
const tagvalue = (tag,mess)=>R.isNil(mess) ? tag : [tag,mess].join(':  ')
const log = tag=>mess=>debug$$1(tagvalue(tag,mess))
const pipelog = tag=>mess=>R.tap(log(tag)(mess))
const toPipe = R.apply(R.pipe)
const pRed = (acc,val)=>R.ifElse(R.is(Array),R.concat(acc),R.append(R.__,acc))(val)
const P = (...pipes)=>toPipe(R.reduce(pRed,[],pipes))
const arrayify = R.unless(R.is(Array),R.of)
const isContainOrEq = P(arrayify,R.flip(R.contains))
const isString = R.is(String)
const {create, env} = sanctuary;
const checkTypes = false
const S = create({checkTypes: checkTypes, env: env})
const prop = {
  type:R.prop('type'),
  val:R.prop('value'),
  head:R.prop('head'),
  tail:R.prop('tail')
}
module.exports = {
  pipelog,log,isString,arrayify,toPipe,P,isContainOrEq,prop,RP,S
}
});

var fabric = createCommonjsModule(function (module) {
const R = require$$3
const syntax$$1 = syntax
const Token = token
const util$$1 = util
const S = util$$1.S
const isString = util$$1.isString
const TokenFabric = (tokenType, condition, transformation) => {
  const onCondition = R.pipe(util$$1.arrayify, R.allPass, S.either(R.__, R.F))
  const addSteps = R.flip(R.concat)([tokenType, S.Right])
  const transformUntouched = R.pipe(
    R.defaultTo([]),
    util$$1.arrayify,
    addSteps,
    util$$1.toPipe,
    S.either(R.__, R.identity))
  return R.when(onCondition(condition), transformUntouched(transformation))
}
const quoteProcessor = function () {
  const isQuote = R.anyPass(R.map(R.equals, syntax$$1.quotes))
  const isQuoted = R.allPass(R.map(e => R.pipe(e, isQuote), [R.head, R.last]))
  const removeQuotes = R.pipe(R.init, R.tail)
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
const contextValidation = str => R.pipe(R.match(/\D\w+/), R.head, R.equals(str))(str)
const isContext = TokenFabric(Token.Context, contextValidation)
const preprocess = S.lift(R.when(isString, R.trim))
const postprocess = R.identity
module.exports = {
  isQuote: quoteProcessor(),
  isType: typesProcessor(),
  isVendor: vendorProcessor(),
  isNumber,
  isContext,
  preprocess,
  postprocess
}
});

var splitter = createCommonjsModule(function (module) {
const R = require$$3
const util$$1 = util
const Token = token
const log = util$$1.pipelog('splitter')
const operators = R.values(syntax.op)
const toPipe = util$$1.toPipe
const stringMorpher = morph=>R.map(R.when(util$$1.isString,morph))
const stringTrim = stringMorpher(R.trim)
const rejectEmpty = R.reject(R.isEmpty)
const opersFuncs = [
  R.split,
  R.pipe(Token.Operator,R.intersperse)
]
const constFuncs = [
  rejectEmpty,
  R.unnest
]
const splitCond = symb=>R.cond([
  [R.is(String),symb],
  [R.T,log('uncaught')]
])
const unnester = symbPipe=>R.pipe(
  symbPipe,
  R.unnest)
const splitsPipe = [
  R.of,
  R.ap(opersFuncs),
  R.concat(R.__,constFuncs),
  toPipe,
  splitCond,
  R.map,
  unnester,
  log('splitPipe')]
const splitter = R.pipe(toPipe,R.map(R.__,operators),toPipe)(splitsPipe)
const cleaner = R.pipe(R.unnest,stringTrim,rejectEmpty,log('end'))
const execFuncs = [
  util$$1.arrayify,
  splitter,
  cleaner]
const exec = toPipe(execFuncs)
module.exports = {exec,cleaner}
});

var stringPreprocess = createCommonjsModule(function (module) {
const R = require$$3
const fab = fabric
const splitter$$1 = splitter
const util$$1 = util
const S = util$$1.S
const pipelog = util$$1.pipelog('preproc')
const singleWordParsing =
  R.pipe(
    fab.preprocess,
    pipelog('->isQuote'),
    fab.isQuote,
    pipelog('->isNumber'),
    fab.isNumber,
    pipelog('->isType'),
    fab.isType,
    pipelog('->isVendor'),
    fab.isVendor,
    pipelog('->isContext'),
    fab.isContext,
    pipelog('->postprocess'),
    fab.postprocess)
const splitKeywords=
  R.unary(R.pipe(
    R.unless(util$$1.isString, () => { throw new Error('`keywords` should be String'); }),
    R.split(' '),
    R.reject(R.isEmpty),
    splitter$$1.exec,
    R.map(R.ifElse(R.is(Object),S.Right,S.Left)),
    pipelog('тэг'),
    R.map(singleWordParsing),
    R.dropRepeatsWith((a,b)=>R.allPass([
      R.propEq('type','operator'),
      R.propEq('obj',','),
      R.eqProps('obj',R.__,b)
    ])(a))
  ))
module.exports = splitKeywords
});

var lexeme = createCommonjsModule(function (module) {
const R = require$$3
const lexemeTypes = syntax.lexemeTypes
class ILexeme {
  constructor(typename,obj) {
    obj.index = obj.head.index
    obj.lexeme = typename
    return obj
  }
}
class Lexeme {
  static Pipe(tokensHList) {
    return new ILexeme(lexemeTypes.pipe,tokensHList)
  }
  static AtomicFunc(tokensHList) {
    return new ILexeme(lexemeTypes.atomic,tokensHList)
  }
  static Expression(tokensHList) {
    return new ILexeme(lexemeTypes.expr,tokensHList)
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

var headList = createCommonjsModule(function (module) {
const R = require$$3
const util$$1 = util
const S = util$$1.S
const P = util$$1.P
class HeadList {
  constructor(rawList, head) {
    if (!R.is(Array,rawList)||R.isEmpty(rawList)) return S.Left('No array recieved')
    if (R.isNil(head)) {
      this.head = R.head(rawList)
      this.tail = R.tail(rawList)
    } else {
      this.head = head
      this.tail = rawList||[]
    }
  }
  map(func) {
    return R.map(func,this.toArray)
  }
  get toArray() {
    return R.prepend(this.head,this.tail)
  }
  get length() {
    return R.defaultTo(0,this.tail.length)+R.isEmpty(this.head)?0:1
  }
  append(e) {
    if (R.isEmpty(this.tail)&&R.isEmpty(this.head))
      this.head = e
    else
      this.tail.push(e)
    return this
  }
  static hasTail(list) {return R.has('tail',list)&&!R.isEmpty(list.tail)}
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
    return new HeadList([{}])
  }
  static isList(list) {
    return R.has('head',list)
  }
}
module.exports = HeadList
});

var tooling = createCommonjsModule(function (module) {
const R = require$$3
const util$$1 = util
const P = util$$1.P
const syntax$$1 = syntax
const types = syntax$$1.types
const op = syntax$$1.op
const multiCheck = func=>R.map(e=>P(util$$1.arrayify,P(func,R.map)(e),R.anyPass))
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

var tree = createCommonjsModule(function (module) {
const R = require$$3
const util$$1 = util
const S = util$$1.S
const P = util$$1.P
const RP = util$$1.RP
const pipelog = util$$1.pipelog('tree')
const prop = util$$1.prop
const Lexeme = lexeme
const HeadList = headList
const types = syntax.types
const tool = tooling
const eq = tool.equals
function stringTokenTransform(data) {
  const indexPipe = (e,i)=>S.lift(R.assoc('index',i))(e)
  const indexation = list=>list.map(indexPipe)
  return P(R.map(S.eitherToMaybe),indexation)(data)
}
function detectContext(data) {
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
  const changeLast = e=>P(util$$1.arrayify,R.append(e.value))
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
});

var convolve = createCommonjsModule(function (module) {
const R = require$$3
const util$$1 = util
const S = util$$1.S
const P = util$$1.P
const log = util$$1.log('tree')
const pipelog = util$$1.pipelog('tree')
const HeadList = headList
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
  const exprToPipe = R.when(Lexeme.its.expr,P(util$$1.prop.tail,e=>new HeadList(e), Lexeme.Pipe))
  const singlePipeToAtomic = R.when(R.both(Lexeme.its.pipe,P(HeadList.hasTail,R.not)),util$$1.prop.head)
  return P(exprToPipe,singlePipeToAtomic)(data)
}
const appendTo = obj=>e=>obj.append(e)
function Stack() {
  this.value = []
  this.push = obj=>this.value.push(appendTo(obj))
  this.pushLast = result=>this.push(HeadList.lastR(result,true))
  this.pop = ()=>this.value.pop()
  this.addToLast = val=>R.last(this.value)(val)
}
function convolve(data) {
  if (!R.is(Array,data)) return S.Left('No array recieved')
  var result = HeadList.emptyList()
  let stack = new Stack()
  let state = states.empty
  let i = 0
  while(i<data.length) {
    var e = data[i]
    let nextState = stConds(e)
    let doAction = switches[state][nextState]
    switch(doAction) {
      case actions.child:
        stack.pushLast(result)
        break
      case actions.parent:
        stack.pop()
        break
    }
    state = nextState
    stack.addToLast(optimise(e))
    i++
  }
  return P(Lexeme.Pipe,optimise)(result)
}
module.exports = convolve
});

var say = createCommonjsModule(function (module) {
const R = require$$3
const HeadList = headList
const Lexeme = lexeme
const util$$1 = util
const P = util$$1.P
function CompileException(obj) {
  this.message = `Can not compile object ${obj}`
  this.name = "Compile exeption"
}
function collectData(obj) {
  const collect = R.cond([
    [R.is(Array),sayPipe],
    [P(HeadList.isList,R.not),util$$1.prop.val],
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
});

var index = createCommonjsModule(function (module) {
const preproc = stringPreprocess
const getTree = tree
const convolve$$1 = convolve
const util$$1 = util
const P = util$$1.P
const log = util$$1.log('index')
const Say = say
function say$$1(data) {
  return P(preproc,getTree,convolve$$1,/*R.tap(e=>Print.headList('conv',e,-1)),*/ Say)(data)
}
const pureExample = "data sright :: head prop 'index' splitAt _ @data sright"
const simple = "when <| == 1 not <|> + 10 |> + 100"
log('example')(pureExample)
let word = say$$1(simple)
module.exports = say$$1
});

export default index;
//# sourceMappingURL=speak-r.jsnext.js.map
