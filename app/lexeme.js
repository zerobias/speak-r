const R = require('ramda')

const HeadList = require('./head-list.js')

const lexemeTypes = {
  pipe:'Pipe',
  context:'Context',
  atomic:'AtomicFunc',
  expr:'Expression'
}

class ILexeme {
  constructor(typename,obj) {
    obj.index = obj.head.index
    obj.lexeme = typename
    // obj.type = 'lexeme'
    return obj
  }
}
class Lexeme {
  static Pipe(tokensHList) {
    return new ILexeme(lexemeTypes.pipe,tokensHList)
  }
  static AtomicFunc(tokensHList) {
    return new ILexeme(lexemeTypes.atomic,tokensHList)
  }
  static Expression(tokensHList) {
    return new ILexeme(lexemeTypes.expr,tokensHList)
  }
  static Context(token) {
    return new Lexeme(lexemeTypes.context,token)
  }
  constructor(typename,obj) {
    console.error('\n!!!!!!------------Used deprecated Lexeme object!\n')
    this.lexeme = typename
    this.index = obj.index
    this._value = obj.value
    this.type = 'lexeme'
  }
  get value() {
    console.error('\n!!!!!!------------Used deprecated get method!\n')
    return this._value
  }
  set value(val) {
    console.error('\n!!!!!!------------Used deprecated set method!\n')
    this._value = val
  }
}

module.exports = Lexeme