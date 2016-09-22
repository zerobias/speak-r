const R = require('ramda')
const types = require('./lang/syntax').types
/*class Token {
  constructor(type,value) {
    this.type = type
    this.value = value
  }
  // toString(){return `type ${this.type}\nvalue ${this.value}`+this.index?`${this.index}`:''}
}*/

const TokenFabric = R.curry((category,obj)=>{
  return /*new Token(category,obj)*/{
    type:category,
    value:obj
  }
})

module.exports = {
  Type:     TokenFabric(types.type),
  R:        TokenFabric(types.R),
  String:   TokenFabric(types.string),
  Number:   TokenFabric(types.number),
  Operator: TokenFabric(types.op),
  Any:      TokenFabric(types.any),
  Context:  TokenFabric(types.context),
  Arg:      TokenFabric(types.arg)
}