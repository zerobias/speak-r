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

Object.defineProperty(Outfall, 'gate', { get: function() { return new Outfall() } })
Object.defineProperty(Outfall.prototype, 'pipe', {
  get: function() {
    const self = this
    return function(data) {
      self.updated = true
      self._data = data
      return data[0]
    }
  }
})

Outfall.prototype.Spout = function(index, isArg = true) {
  return new Spout(this, index, isArg)
}

class Spout {
  get data() {
    return this.parent._data
  }
  get id() {
    return this.parent.id
  }
  pipe() {
    log('spout pipe')(this.data[this.index], this)
    if (R.isNil(this.data)) return null
    return this.isArg
      ? this.data[this.index] //TODO WTF
      : this.data[this.index]
  }
  constructor(parent, index, isArg) {
    this.parent = parent
    this.index = index
    this.isArg = isArg
  }
}

// let stream = Outfall.gate
// let joint = stream.Spout()

module.exports = Outfall