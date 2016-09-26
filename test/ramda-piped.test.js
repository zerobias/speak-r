const R = require('ramda')
const tap = require('tap').test

const RP = require('../app/model/ramda-piped')

tap('smoke test',function(t){
  const isFunc = (obj,text) => t.is(R.is(Function,obj),true,text)
  isFunc(RP,'Ramda-piped exists')
  isFunc(RP().inc, 'RP.inc exists')
  t.end()
})

tap('basic function',function(t){
  const data = { a:2, b:3 }
  const f = {
    orig:R.add(data.a),
    proxy:RP().add(data.a).run
  }
  t.is(
    f.proxy(data.b),
    f.orig(data.b),
    'RP.add should work as R.add')
  t.end()
})

tap('Piping',function(t) {
  const data = { a:10, b:2, c:10 }
  const f = {
    orig: R.pipe(
      R.add(data.a),
      R.multiply(data.b)),
    proxy: RP()
      .add(10)
      .multiply(2)
  }
  t.is(R.is(Array,f.proxy.store),true,'.store is Array with R funcs')
  t.is(
    f.proxy.run(data.c),
    f.orig(data.c),
    'RP.add.multiply should work as pipeline')
  t.end()
})