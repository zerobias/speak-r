const R = require('ramda')

const util = require('../util')
const S = util.S

const P = util.P

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
    this[Symbol.iterator] = function* () {
      yield this.head
      for (let e of this.tail)
        yield e
    }
  }
  get toArray() {
    return R.prepend(this.head,this.tail)
  }
  get length() {
    return R.defaultTo(0,this.tail.length)+R.isEmpty(this.head)?0:1
  }
  append(e) {
    if (R.isEmpty(this.tail)&&R.isEmpty(this.head))
      this.head = e
    else
      this.tail.push(e)
    return this
  }
  static get prepend() {
    return R.curry((val,list)=>{
      list.tail = R.prepend(list.head, list.tail)
      list.head = val
      return list
    })
  }
  static cyclic(func) {
    return function(list) {
      for(let e of list)
        e = P(R.when(
          HeadList.isList,
          HeadList.cyclic(func)),func)(e)
      return list
    }
  }

  static hasTail(list) {return R.has('tail',list)&&!R.isEmpty(list.tail)}
  static last(list) {
    return HeadList.hasTail(list)
      ? R.last(list.tail)
      : list.head
  }
  static lastR(list,isStrict=false) {
    const _hasTail = R.has('tail')
    const notHas = P(_hasTail,R.not)
    const cond = R.either(notHas,P(HeadList.last,notHas))
    return R.until(isStrict?cond:notHas,HeadList.last)(list)
  }
  static emptyList() {
    return new HeadList([{}])
  }
  static isList(list) {
    return R.has('head',list)
  }
}

module.exports = HeadList