const R = require('ramda')
class Claimer {
  constructor(index) {
    this.dataLens = R.lensIndex(index)
    this.value;
  }
  static listener(claim) {
    return data => claim.value = R.view(claim.dataLens,data)
  }
  get pipe() {
    let self = this
    return function(pipeData) {
      if (self.value)
        return self.value(pipeData)
      else {
        console.warn('empty Claimer!',self,pipeData)
        return pipeData
      }
    }
  }
}
class Claimed {
  addListener(listenerCb) {
    this.listeners.push(Claimer.listener(listenerCb))
  }
  constructor() {
    this.listeners = []
  }

  get onData() {
    let listeners = this.listeners
    return function(data) {
      R.unless(R.isEmpty,R.forEach(e=>e(data)))(listeners)
      return R.head(data)
    }
  }
}

module.exports = {Claimer,Claimed}