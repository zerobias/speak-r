const R = require('ramda')
const tap = require('tap').test

const unit = require('../app/pipefy')

const funcCompare = ref => func => R.converge(R.equals,[ref,func])

tap('smoke test',function(t){
  const isFunc = (obj,text) => t.is(R.is(Function,obj),true,text)
  isFunc(unit,'Pipefy exists')
  t.end()
})

tap('pipelining',function(t){
  const steps = {
    a:R.when(R.equals(0),()=>10),
    b:R.add(10),
    c:R.add(100)
  }
  const refer = R.pipe(steps.a,steps.b,steps.c)
  const testVal = 0
  const comp = funcCompare(refer)
  let pipe
  t.notThrow(()=>pipe=unit(steps.a,steps.b,steps.c),'pipeline accept pipe as args')
  t.equals(comp(pipe)(testVal),true,'Works as referenced R.pipe')
  t.notThrow(()=>pipe=unit([steps.a,steps.b,steps.c]),'pipeline accept pipe as array')
  t.equals(comp(pipe)(testVal),true,'Pipe from array works as referenced R.pipe')
  t.end()
})
