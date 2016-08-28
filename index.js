const R = require('ramda')

const example ="when <- is Array |> map add 2, map objOf 'must' "
const eRes = R.when(R.is(Array),R.pipe(R.map(R.add(2)),R.map(R.objOf('must'))))

const expectedMorph = [
  [example,splitKeywords],
  ["|> concat <- 'concat' take 8",R.pipe(R.concat('concat'),R.take(8))],
  ["|> add 10 dec 3",R.pipe(R.add(10),R.dec(3))],
  ["pipe add 10 dec 3",R.pipe(R.add(10),R.dec(3))]
]
const symbols = {
  pipe:'|>',
  toLast:'<-',
  quotes:['"',"'",'`'],

}
let speakerScope = {
  types:['Number','Array','String','Boolean','Object','Function'],
  R:R
}
const transformObj = typename=>obj=>{return{type:typename,obj:obj}}
const FabricMaker = typelist=>R.zipObj(typelist,R.map(name=>transformObj(name),typelist))
const Fabric = FabricMaker(['string','number','func','any'])

const isQuote = R.anyPass( R.map(R.equals,symbols.quotes) )
const isQuoted = R.allPass(R.map(e=>R.pipe(e,isQuote),[R.head,R.last]))
const removeQuotes = R.pipe(R.init,R.tail)

const numberProcessing = R.when(isFinite,R.pipe(parseFloat,Fabric.number))

const quoteProcessing = R.when(isQuoted,R.pipe(removeQuotes,Fabric.string))

//const

//const quoteChecker = R.allPass(R.map(e=>quoteGetter(e),[R.head,R.takeLast]))
function splitKeywords(keywords) {
  return R.unary(R.pipe(
    R.unless(R.is(String), () => { throw new Error('`keywords` should be String'); }),
    R.split(' '),
    R.map(R.trim),
    R.reject(R.isEmpty),
    R.map(numberProcessing),
    R.map(quoteProcessing)
  ))(keywords)
}

console.log(splitKeywords(example))
class Speaker {

}
//eRes([3,2,5,1])

let quotedString = "'word`"
//quoteProcessing(quotedString)