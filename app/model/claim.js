const R = require('ramda')
const util = require('../util')
const P = util.P
const log = util.log('model:claim')
const pipelog = util.pipelog('model:claim')
class Claimer {
  constructor(config) {
    // this.dataLens = R.lensIndex(config.index)
    this.index = config.index
    this.isArg = config.isArg
    this.value;
  }
  static listener(claim) {
    return function(data) {
      claim.value = data[claim.index]
      return claim
    }
  }
  get data() {
    let self = this
    log('this++')(this)
    return function(pipeData) {
      log('self++')(self.value, pipeData)
      if (self.value)
        return self.isArg
          ? self.value(pipeData)
          : self.value(pipeData)
      else {
        console.warn('empty Claimer!',self,self.value,pipeData)
        return pipeData
      }
    }
  }
}
class Claimed {
  addListener(listenerCb) {
    log('add listener')(listenerCb)
    this.listeners.push(Claimer.listener(listenerCb))
    log('listeners')(this.listeners)
  }
  constructor() {
    this.listeners = []
  }

  get onData() {
    let self = this
    return function(data) {
      log('data onData')(data)
      const update = R.forEach(P(pipelog('upd'),e=>e(data).value,pipelog('onData')))
      R.unless(R.isEmpty,update)(self.listeners)
      return data
    }
  }
  Claimer(config) {
    let newClaimer = new Claimer(config)
    this.addListener(newClaimer)
    return newClaimer
  }
}

module.exports = Claimed