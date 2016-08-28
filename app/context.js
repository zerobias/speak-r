const R = require('ramda')
const syntax = require('./syntax.js')

let basicContext = new Map()
basicContext.set('types',['Number','Array','String','Boolean','Object','Function'])
basicContext.set('R',R)
basicContext.set('syntax',syntax)
class Context {
  getter() {
    return this.cool
  }
  constructor(keyOrDict) {
    this._data = new Map()

  }
  get(key) {
    return R.cond([
      [basicContext.has,basicContext.get],
      [this._data.has,this._data.get],
      [R.T,null]
    ])(key)
  }
  set(key) {
    return R.cond([
      [this._data.has,this._data.get],
      [R.T,null]
    ])(key)
  }
  static init(keyOrDict,maybeVal) {
    let miner = new Context()
    R.isNil(maybeVal)
      ? R.when(
          R.is(Object),
          R.pipe(
            R.toPairs,
            R.map(
              e=>miner.set(e[0],e[1]))))(keyOrDict)
      : miner.set(keyOrDict,maybeVal)
  }
}

module.exports = { FabricConstructor,quoteProcessor }