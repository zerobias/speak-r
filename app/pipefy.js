const R = require('ramda')

const red = func => R.reduce(func,[])
const reducer = red(logic)
const ifArr = R.pipe(
  R.flatten,
  reducer,
  R.flip(R.concat)
)
function logic(acc,val) {
  if (R.is(Array)(val))
    return ifArr(val)(acc)
  else
    return R.append(val,acc)
}
function P(...data) {
  let actionList = reducer(data)
  return R.pipe(...actionList)
}

module.exports = P