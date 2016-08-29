const R = require('ramda')

const fab = require('./fabric.js')

const syntax = require('./syntax.js')

const example ="!> when <- is Array , map <- add 2 map objOf `must`"

const result = R.pipe(R.when(R.is(Array),R.compose(R.map,R.add(2))),R.map(R.objOf('must')))



const Fabric = fab.Fabric

const numberProcessing = R.when(isFinite,R.pipe(parseFloat,Fabric.number))
const quoteProcessing = fab.quoteProcessor()

function splitKeywords(keywords) {
  return R.unary(R.pipe(
    R.unless(R.is(String), () => { throw new Error('`keywords` should be String'); }),
    R.map(fab.operandProcessor),
    R.split(' '),
    R.map(R.trim),
    //R.reject(R.isEmpty),
    R.map(numberProcessing),
    R.map(quoteProcessing),
    R.map(fab.isVendor)
  ))(keywords)
}

console.log(splitKeywords(example))
class Speaker {

}
//eRes([3,2,5,1])

//let quotedString = "'word`"
//quoteProcessing(quotedString)

module.exports = {}