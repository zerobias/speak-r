const R = require('ramda')

const HeadList = require('./head-list')

function Stack() {
  const appendTo = obj => e => obj.append(e)
  this.value = []
  this.push = obj => this.value.push(appendTo(obj))
  this.pushLast = result => this.push(HeadList.lastR(result, true))
  this.pop = () => this.value.pop()
  this.addToLast = val => R.last(this.value)(val)
}

module.exports = () => new Stack()