const util = require('../util')
const R = require('ramda')
const P = util.P
const log = util.pipelog('tree')
const pipelog = util.pipelog('tree')

function Outfall() {
  this.id = Math.round(Math.random() * 10e5)
  this.updated = false
  this._data = null
}

Object.defineProperty(Outfall, 'gate', { get: function () { return new Outfall() } })
Object.defineProperty(Outfall.prototype, 'pipe', {
  get: function () {
    let self = this
    return function (data) {
      self.updated = true
      self._data = data
      return data[0]
    }
  }
})

Outfall.prototype.Spout = function (index,isArg = true) {
  return Spout(this, index, isArg)
}

function Spout(parent, index,isArg) {
  let spout = Object.create(parent, {
    data: { get: function () { return parent._data }, enumerable: true },
    index: { get: function() { return index }, enumerable: true },
    id: { get: function () { return parent.id }, enumerable: true },
    isArg: { value: isArg, enumerable: true }
  })
  Object.defineProperty(spout, 'pipe', { value:
    function () {
      log('spout pipe')(spout.data[spout.index],spout)
      if(R.isNil(spout.data)) return null
      return spout.isArg
        ? spout.data[spout.index]
        : spout.data[spout.index] },
    enumerable: true })
  return spout
}

// let stream = Outfall.gate
// let joint = stream.Spout()

module.exports = Outfall