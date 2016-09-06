const R = require('ramda')
const tap = require('tape')
const tapSpec = require('tap-spec')
const tested = require('../app/index.js')


const example ="when |> when is String , map <- add 2 map objOf `must`"
const example2 ="when |> Array |> map <- add 2 map objOf `must`"
const exampleOnChecking = "prepend => take 2 -> equals 'word' apply => ifElse"
const result = R.pipe(R.when(R.is(Array),R.compose(R.map,R.add(2))),R.map(R.objOf('must')))

const onChecking = R.pipe(  R.prepend(  R.take(2) , R.equals('|>') ) , R.apply(R.ifElse) )

tap.createStream()
  .pipe(tapSpec())
  .pipe(process.stdout)

tap(`operators`, function (t) {
  // t.plan(2)
  t.ok(tested,tested)
  t.doesNotThrow(()=>tested(exampleOnChecking),exampleOnChecking)
  console.log(tested(exampleOnChecking))
  t.end()
})

console.log('---index test')
module.exports = {}