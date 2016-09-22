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
      return data
    }
  }
})

Outfall.prototype.Spout = function (isFunc = true) {
  return Spout(this, isFunc)
}

function Spout(parent, isFunc) {
  let spout = Object.create(parent, {
    data: { get: function () { return parent._data }, enumerable: true },
    id: { get: function () { return parent.id }, enumerable: true },
    isFunc: { value: isFunc, enumerable: true }
  })
  Object.defineProperty(spout, 'pipe', { value: function (flow) { return spout.isFunc ? spout.data(flow) : flow(spout.data) }, enumerable: true })
  return spout
}

// let stream = Outfall.gate
// let joint = stream.Spout()

module.exports = Outfall