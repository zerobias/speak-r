const R = require('ramda')


const Token = R.curry((category,obj)=>{
  return {
    type:category,
    value:obj
  }
})

module.exports = {
  Type:     Token('type'),
  R:        Token('R'),
  String:   Token('string'),
  Number:   Token('number'),
  Operator: Token('operator'),
  Any:      Token('any'),
  Context:  Token('context')
}