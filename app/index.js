const R = require('ramda')
// const S = require('sanctuary')

const preproc = require('./core/string-preprocess')
const getTree = require('./core/tree')
const convolve = require('./core/convolve')
const Speak = require('./core/say')

const util = require('./util')
const P = util.P
const log = util.log('index')
const pipelog = util.pipelog('index')
const Print = require('./print')



const taplog = tag=>R.tap(e=>Print.headList(tag,e.tree,-1))

const maptaphead = tag=> R.tap(P(
  R.prop('tree'),
  R.map(e=>Print.headList(tag,e,-1))))

const mapprint = tag => R.tap(R.map(pipelog(tag)))

function say(data) {
  return P(
    preproc,mapprint('preproc'),
    getTree,maptaphead('getTree'),
    convolve,taplog('conv'),
    Speak)(data)
}

const pureExample = "indexes data sright :: head prop 'index' append _ @data sright"// _  " //example := //
const simple = "when <| == 1 not <|> + 10 |> + 100"
// const pure = P( R.when(P(R.equals(1),R.not),R.add(10)),R.add(100))

// let convolved = say(pureExample)
log('example')(pureExample)

// Print.headList('conv',convolved,-1)
let word = say(pureExample)
// log('word')(word)
let indexes = [{index:[1,3]},{index:[0,1,2,3]},0]
let dat = [0,10,20,30,40,50]
let sright = R.objOf('result')
let res = word(indexes,dat,sright)
log('res')(res)
// word.then(value=>{
//   let finalRes = value([indexes,dat,sright])
//   log('res')(value,finalRes)
// },log('err'))

module.exports = say