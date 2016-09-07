const R = require('ramda')
const S = require('sanctuary')


const mValueComp = (val,field)=>data=>S.Maybe.of(R.propEq(R.defaultTo('value',field),val)).ap(data).value
const isOpenS = mValueComp('<-')
const isCloseS = mValueComp(',')
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
class HeadList {
  constructor(rawList, head) {
    if (!R.is(Array,rawList)||R.isEmpty(rawList)) return S.Left('No array recieved')
    if (R.isNil(head)) {
      this.head = R.head(rawList)
      this.tail = R.tail(rawList)
    } else {
      this.head = head
      this.tail = rawList||[]
    }
  }
  map(func) {
    return R.map(func,this.tail)
  }
  append(e) {
    this.tail.push(e)
    return this
  }
  static hasTail(list) {return R.isEmpty(list.tail)}
  static last(list) {
    return HeadList.hasTail(list)
      ? R.last(list.tail)
      : list.head
  }
  static emptyList() {
    return new HeadList([{}])
  }
}

module.exports = { HeadList, balanceReducer }