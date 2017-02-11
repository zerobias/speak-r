const R = require('ramda')

const util = require('../util')
const S = util.S
const P = util.P
const isof = util.isof

class HeadList {
  constructor(rawData) {
    const list = util.arrayify(rawData)
    this.head = R.head(list) || {}
    this.tail = R.tail(list)
  }
  get toArray() {
    return R.prepend(this.head, this.tail)
  }
  * [Symbol.iterator]() {
    yield this.head
    for (const e of this.tail)
      yield e
  }
  get length() {
    return R.converge(R.add, [
      R.pathOr(0, ['tail', 'length']),
      P(R.prop('head'), R.isNil, e => e ? 0 : 1)])
  }
  append(e) {
    if (HeadList.isEmpty(this))
      this.head = e
    else
      this.tail.push(e)
    return this
  }
  static create(e) {
    return new HeadList(e)
  }
  static get prepend() {
    return R.curry((val, list) => {
      list.tail = R.prepend(list.head, list.tail)
      list.head = val
      return list
    })
  }
  static cyclic(func) {
    return function(list) {
      for (let e of list)
        e = P(R.when(
          HeadList.isList,
          HeadList.cyclic(func)), func)(e)
      return list
    }
  }
  static isEmpty(list) {
    return !HeadList.hasTail(list)&&R.isEmpty(list.head)
  }
  static get hasTail() {
    return R.both(R.has('tail'), P(R.prop('tail'), isof.Full))
  }
  static last(list) {
    return HeadList.hasTail(list)
      ? R.last(list.tail)
      : list.head
  }
  static lastR(list, isStrict=false) {
    const _hasTail = R.has('tail')
    const notHas = P(_hasTail, R.not)
    const cond = R.either(notHas, P(HeadList.last, notHas))
    return R.until(isStrict?cond:notHas, HeadList.last)(list)
  }
  static emptyList() {
    return new HeadList()
  }
  static isList(list) {
    return R.has('head', list)
  }
}

module.exports = HeadList