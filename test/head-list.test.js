const R = require('ramda')
const tap = require('tap').test

const HeadList = require('../app/model/head-list')


tap('Head-list smoke tests', function (t) {
  t.ok(HeadList, 'HeadList exists')
  let list = HeadList.emptyList();
  t.ok(list, 'emtyList return new list')
  t.ok(
    list.head &&
    list.tail &&
    R.is(Array, list.tail) &&
    list.tail.length === 0,
    'exists object head and array tail')
  t.ok(HeadList.isList(list),
    'static method isList detect class objects')
  t.equals(list.length, 0, 'length get current summ length')
  let added = 'obj2'
  t.equals(list.append('obj1').length, 1, 'append add object into list')
  t.equals(list.append(added).tail[0], added, 'next appended should be in tail')
  const isArrayLength2 = R.both(R.is(Array), R.pipe(R.length, R.equals(2)))
  t.ok(isArrayLength2(list.toArray), 'toArray return object as array')
  t.equals(HeadList.prepend(added,list).head,added,'prepend - ctatic method')
  // const hasTailCond = R.both()
  // t.ok(R.both())
  t.end()
})

