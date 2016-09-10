const R = require('ramda')
const S = require('sanctuary')

const balanceReducer = (isOpen,isClose)=>arr=> {
  if (!R.is(Array,arr)) return S.Left('No array recieved')
  let i = 0
  var stack = []
  var result = []
  while(i<arr.length) {
    if (isOpen(arr[i]))
      stack.push(i)
    else if (isClose(arr[i]))
      result.push([stack.pop(),i])
    i++
  }
  return S.Right({
    opened:stack,
    pairs:result
  })
}
//log('balance')(balanceReducer(isOpenS,isCloseS)(justData).value)

module.exports = { balanceReducer }