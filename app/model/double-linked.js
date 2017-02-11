const R = require('ramda')

const nil = R.isNil

class DoubleLinked {
  constructor(index=0, past=null, next=null) {
    this.past = past
    this.next = next
    this.index = index
    this.lens = R.lensIndex(index)
  }
  get getter() {
    return R.view(this.lens)
  }
  static getter(e, data) {
    return R.view(e.lens, data)
  }
  setNext(next) {
    this.next = next
  }
  get isFirst() {
    return nil(this.past)
  }
  get isLast() {
    return nil(this.next)
  }
  static first() {
    return new DoubleLinked()
  }
}
class DLinkedList {
  constructor(arr) {
    this.source = arr
    this.first = null
    this.last = null
    this.length = 0
  }
  inc() {
    return this.length++
  }
  dec() {
    return this.length--
  }
  // getter(data) {
  //   return function(e) {
  //     return R.view(e.lens,data)
  //   }
  // }
  static create(arr) {
    const list = new DLinkedList(arr)
    const length = R.length(arr)
    let i=0
    while (i<length) {
      list.inc()
      if (i===0) {
        list.first = DoubleLinked.first()
        list.last = list.first
      } else {
        const e = new DoubleLinked(i, list.last)
        list.last.setNext(e)
        list.last = e
      }
      i++
    }
    return list
  }
  static remove(list, e) {
    if (e.isFirst&&e.isLast) {
      list.first = null
      list.last = null
    } else if (!e.isFirst&&!e.isLast) {
      e.past.next = e.next
      e.next.past = e.past
    } else if (e.isFirst) {
      list.first = e.next
      list.first.past = null
    } else if (e.isLast) {
      list.last = e.past
      list.last.next = null
    }
    list.dec()
  }
  * [Symbol.iterator]() {
    yield this.first
    let next = this.first.next
    while (!nil(next)) {
      yield next
      next = next.next
    }
  }

}

module.exports = DLinkedList