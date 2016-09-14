const R = require('ramda')

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
  Type:     TokenFabric('type'),
  R:        TokenFabric('R'),
  String:   TokenFabric('string'),
  Number:   TokenFabric('number'),
  Operator: TokenFabric('operator'),
  Any:      TokenFabric('any'),
  Context:  TokenFabric('context'),
  Arg:      TokenFabric('arg')
}