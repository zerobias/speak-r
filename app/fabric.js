const R = require('ramda')
const syntax = require('./syntax.js')

const FabricConstructor = (appInnerTypes)=>{
  const transformObj = typename=>obj=>{return{type:typename,obj:obj}}
  const FabricMaker = typelist=>R.zipObj(typelist,R.map(name=>transformObj(name),typelist))
  return FabricMaker(appInnerTypes)
}
const Fabric = FabricConstructor(syntax.types)
const quoteProcessor = ()=>{
  const isQuote = R.anyPass( R.map(R.equals,syntax.quotes) )
  const isQuoted = R.allPass(R.map(e=>R.pipe(e,isQuote),[R.head,R.last]))
  const removeQuotes = R.pipe(R.init,R.tail)
  return R.when(isQuoted,R.pipe(removeQuotes,Fabric.string))
}
const operandProcessor = ()=>{
  const operators = [
    ['|>','pipe'],
    ['>|','pipeEnd'],
    ['<-','intoPrevious'],
    [',','comma']
  ]
}
//const types = ['<-','|>',',']
//const example ="when <- is Array |> map add 2, , map <- objOf `must` "

const toData = R.objOf('value')
const mapped = list => func => R.map(func,list)
let apTypes = mapped(syntax.types)
let arrow = '<-'
let comma = ','

const ofString = obj=>R.when(R.is(String),R.of)(obj)
const splitter = obj=>R.pipe(R.split,R.chain)(obj)
const reappender = obj=>R.pipe(toData,R.intersperse)(obj)
const unionAction = obj=>R.pipe( R.when(R.is(String),R.juxt([splitter,reappender])) , R.apply(R.pipe) )(obj)

const symbolAction = symb=>obj=>R.pipe(ofString,unionAction(symb))(obj)
const symbolListAction = list=>obj=>R.apply(R.pipe,R.map(symbolAction,list))(obj)
let symbolActions = symbolListAction(syntax.types)
//symbolActions(example)

//unionAction(comma)(unionAction(arrow)([example]))
//arrowAction(example)
const vendorProcessor = ()=>{
  const isFunc = R.is(Function)
  const isRamda = obj=>isFunc(R[obj])
  const transformObj = obj=>{return{type:'R',obj:R[obj]}}
  return R.when(isRamda,transformObj)
}
const isVendor = vendorProcessor()
module.exports = { Fabric,quoteProcessor,operandProcessor,isVendor }