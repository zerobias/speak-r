const R = require('ramda')

const expectedMorph = [
  [example,splitKeywords],
  ["|> concat <- 'concat' take 8",R.pipe(R.concat('concat'),R.take(8))],
  ["|> add 10 dec 3",R.pipe(R.add(10),R.dec(3))],
  ["pipe add 10 dec 3",R.pipe(R.add(10),R.dec(3))]
]

module.exports = { expectedMorph }