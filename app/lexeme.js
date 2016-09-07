class Lexeme {
  static get types() {
    return {
      pipe:'Pipe',
      context:'Context',
      atomic:'AtomicFunc'
    }
  }
  static Pipe(tokensHList) {
    return new Lexeme(Lexeme.types.pipe,{index:tokensHList.head.index,value:tokensHList})
  }
  static AtomicFunc(tokensHList) {
    return new Lexeme(Lexeme.types.atomic,{index:tokensHList.head.index,value:tokensHList})
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