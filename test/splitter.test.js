const R = require('ramda')
const tap = require('tap').test
// const debug = require('debug')('splitter test')
var tested = require('../app/core/splitter')

const example ="prepend <| take 2 <|> equals 'word' |> apply <| ifElse"

tap(`splitter is function`, function (t) {
  t.doesNotThrow(tested.exec,tested.exec)
  t.doesNotThrow(()=>tested.exec(example),tested.exec)
  let execResult = tested.exec(example)
  t.ok(execResult,execResult)
  t.equal(R.is(Array,execResult),true)
  // t.equal(R.all(R.is(String))(execResult),true)
  t.equal(execResult.length,9,execResult)
  t.end()
})
module.exports = _tested =>tested=_tested