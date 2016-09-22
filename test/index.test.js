const R = require('ramda')
const tap = require('tape')
const tapSpec = require('tap-spec')
const tested = require('../app/index')

const examples = {
  e1:"when <| is Array <|> compose <| map <|> + 2 |> map objOf 'must'",
  simple:"when <| == 1 not <|> + 10 |> + 100",
  onChecking:"prepend <| take 2 <|> equals 'word' |> apply <| ifElse",
  trans:"ifElse <| prop 'value' propEq 'type' 'R' <|> prop 'value' of append |> map",
  split:"data sright :: head prop 'index' splitAt _ @data sright"
  //P(R.head,R.prop('index'),R.splitAt(R.__,data),S.Right)
}

// const example ="when |> when is String , map <- add 2 map objOf `must`"
// const example2 ="when |> Array |> map <- add 2 map objOf `must`"

// const exampleOnChecking = "prepend => take 2 -> equals 'word' apply => ifElse"
// const result = R.pipe(R.when(R.is(Array),R.compose(R.map,R.add(2))),R.map(R.objOf('must')))

// const onChecking = R.pipe(  R.prepend(  R.take(2) , R.equals('|>') ) , R.apply(R.ifElse) )

const exmRunner = R.pipe(R.toPairs,R.forEach(e=>tap(e[0],function(t){
  t.doesNotThrow(()=>tested(e[1]),e[1])
  t.end()
})))

tap.createStream()
  .pipe(tapSpec())
  .pipe(process.stdout)

exmRunner(examples)
console.log('---index test')
module.exports = {}