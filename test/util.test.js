const R = require('ramda')
const tap = require('tap').test

const unit = require('../app/util')

tap('Loggers',function(t) {
  t.ok(unit.log,'log exists')
  t.ok(unit.pipelog,'pipelog exists')

  t.notThrow(()=>unit.log('tag'),'logger init')
  t.notThrow(()=>unit.pipelog('tag'),'pipelog init')
  const logs = {
    l:unit.log('tag'),
    p:unit.pipelog('tag')
  }
  t.notThrow(()=>logs.l('data'),'log dont fall')
  const text = {
    tag:'log tag',
    data:'logged message',
    arr:['we','send','some','values']
  }
  const pipelog = logs.p(text.tag)
  t.equal(
    pipelog(text.data),
    text.data,'pipelog return logged value')
  t.notEqual(
    pipelog(...text.arr),
    text.arr[0],'pipelog should not return only first value')
  t.strictDeepEqual(
    pipelog(...text.arr),
    text.arr,'pipelog return logged value')
  t.end()
})

tap('is String',function(t) {
  const o = unit.isString
  t.equal(o('str'),true)
  t.equal(o(45),false)
  t.end()
})
