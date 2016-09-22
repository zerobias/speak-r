const R = require('ramda')
const util = require('./util')
const log = util.log('tree')
class Claimer {
  constructor(config) {
    this.dataLens = R.lensIndex(config.index)
    this.isArg = config.isArg
    this.value;
  }
  static listener(claim) {
    return data => {log('listen!')(data); claim.value = R.view(claim.dataLens,data)}
  }
  get data() {
    let self = this
    return function(pipeData) {
      if (self.value)
        return self.isArg
          ? self.value
          : self.value(pipeData)
      else {
        console.warn('empty Claimer!',self,pipeData)
        return pipeData
      }
    }
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
  get arg() {
    let self = this
    return function() {
      if (self.value)
        return self.value
      else {
        console.warn('empty Claimer!',self,null)
        return null
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
  Claimer(config) {
    let newClaimer = new Claimer(config)
    this.addListener(newClaimer)
    return newClaimer
  }
}

module.exports = {Claimer,Claimed}