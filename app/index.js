// const R = require('ramda')
// const S = require('sanctuary')

const preproc = require('./string-preprocess')
const getTree = require('./tree')
const convolve = require('./convolve')

const util = require('./util')
const P = util.P
const log = util.log('index')
// const pipelog = util.pipelog('index')
// const Print = require('./print.js')
const Say = require('./say.js')

function say(data) {
  return P(preproc,getTree,convolve,/*R.tap(e=>Print.headList('conv',e,-1)),*/ Say)(data)
}

const pureExample = "data sright :: head prop 'index' splitAt _ @data sright"
const simple = "when <| == 1 not <|> + 10 |> + 100"
// const pure = P( R.when(P(R.equals(1),R.not),R.add(10)),R.add(100))

// let convolved = say(pureExample)
log('example')(pureExample)

// Print.headList('conv',convolved,-1)
let word = say(simple)
// let res = word(1)
// log('word')(res)

module.exports = say