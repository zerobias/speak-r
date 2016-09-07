class Lexeme {
  static get types() {
    return {
      pipe:'Pipe',
      context:'Context',
      atomic:'AtomicFunc'
    }
  }
  static Pipe(tokens) {
    return new Lexeme(Lexeme.types.pipe,{index:tokens[0].index,value:tokens})
  }
  static AtomicFunc(tokens) {
    return new Lexeme(Lexeme.types.atomic,{index:tokens[0].index,value:tokens})
  }
  static Context(token) {
    return new Lexeme(Lexeme.types.context,token)
  }
  constructor(typename,obj) {
    this.lexeme = typename
    this.index = obj.index
    this.value = obj.value
    this.type = 'lexeme'
  }
}

module.exports = Lexeme