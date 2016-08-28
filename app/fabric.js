const R = require('ramda')
const syntax = require('./syntax.js')

const FabricConstructor = (appInnerTypes)=>{
  const transformObj = typename=>obj=>{return{type:typename,obj:obj}}
  const FabricMaker = typelist=>R.zipObj(typelist,R.map(name=>transformObj(name),typelist))
  return FabricMaker(appInnerTypes)
}
const quoteProcessor = (quotes)=>{
  const isQuote = R.anyPass( R.map(R.equals,quotes) )
  const isQuoted = R.allPass(R.map(e=>R.pipe(e,isQuote),[R.head,R.last]))
  const removeQuotes = R.pipe(R.init,R.tail)
  return R.when(isQuoted,R.pipe(removeQuotes,FabricConstructor.string))
}
module.exports = { FabricConstructor,quoteProcessor }