const R = require('ramda')

const expectedMorph = [
  [example,splitKeywords],
  ["|> concat <- 'concat' take 8",R.pipe(R.concat('concat'),R.take(8))],
  ["|> add 10 dec 3",R.pipe(R.add(10),R.dec(3))],
  ["pipe add 10 dec 3",R.pipe(R.add(10),R.dec(3))]
]

const types = ['<-','|>',',']
const example ="when <- is Array |> map add 2, , map <- objOf `must` "

const toData = R.objOf('value')
const mapped = list => func => R.map(func,list)
let apTypes = mapped(types)
let arrow = '<-'
let comma = ','

const logger = name => R.tap(x => console.log(`${name} is ` + x))

//const isNotObject = R.pipe()
const before = logger('before')
const middle = logger('middle')
const after = logger('after')
//const objectProtector

const ofString = R.when(R.is(String),R.of)
const toPipe = R.apply(R.pipe)
const protectedPipe = ofString


const splitter = obj=>R.when(R.is(String),R.pipe(before,R.split,R.chain))(obj)
const reappender = obj=>R.pipe(toData,R.intersperse)(obj)
const unionAction = obj=>R.pipe(
  R.when(R.is(String),R.juxt([splitter,reappender])) , toPipe )(obj)

const symbolAction = symb=>
obj=>R.pipe(ofString,logger('sym'),unionAction(symb))(obj)
const symbolListAction = list=>obj=>toPipe(R.map(symbolAction,list))(obj)
let symbolActions = symbolListAction(types)
//symbolActions(example)

//unionAction(comma)//(unionAction(arrow)([example]))
let aap = toPipe(R.ap([splitter,reappender],[comma]))
aap([example])
//aa([example])


//reappender

module.exports = { expectedMorph }