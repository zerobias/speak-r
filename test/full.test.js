// const R = require('ramda')
const test = require('tap').test

const Say = require('../index')

test('standart test', t => {
  // t.notThrow(() => Say('inc of'), 'standart init not throws')
  // t.notThrow(() => Say`inc of`(0), 'template literal full calling not throws')
  t.is(Say('inc of head')(0), 1, 'standart runs properly')
  // t.is(Say('data :: inc of head')(0), 1, 'standart runs properly')
  t.end()
})

// test('template test', t => {
//   t.notThrow(() => Say`inc of`, 'template literal init not throws')
//   t.notThrow(() => Say`inc of`(0), 'template literal full calling not throws')
//   t.is(Say`inc of head`(0), 1, 'template literal runs properly')
//   t.end()
// })