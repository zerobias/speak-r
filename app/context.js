const R = require('ramda')
const syntax = require('./syntax.js')


class Context {
  static get sharedContext() {
    return R.once(()=>{
      let basicContext = new Map()
      basicContext.set('types',
        ['Number','Array','String','Boolean','Object','Function'])
      basicContext.set('R',R)
      basicContext.set('syntax',syntax)
      return {
        get:basicContext.get,
        has:basicContext.has
      }
    })()
  }
  constructor() {
    this._data = new Map()

  }
  get(key) {
    return R.cond([
      [Context.sharedContext.has,Context.sharedContext.get],
      [this._data.has,this._data.get],
      [R.T,null]
    ])(key)
  }
  set(key,val) {
    this._data.set(key,val)
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

module.exports = Context