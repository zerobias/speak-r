const R = require('ramda')

const lexemeTypes = require('../lang/syntax').lexemeTypes
const HeadList = require('./head-list')

class ILexeme {
  constructor(typename,obj) {
    obj.index = obj.head.index
    obj.lexeme = typename
    return obj
  }
}
class Lexeme {
  static Pipe(tokensList) {
    // const list = HeadList.create(tokensList)
    return new ILexeme(lexemeTypes.pipe,tokensList)
  }
  static AtomicFunc(tokensHList) {
    return new ILexeme(lexemeTypes.atomic,tokensHList)
  }
  static Expression(tokensHList) {
    return new ILexeme(lexemeTypes.expr,tokensHList)
  }
  static Argument(tokensHList) {
    return new ILexeme(lexemeTypes.arg,tokensHList)
  }
  static get its() {
    const eq = R.propEq('lexeme')
    return R.map(eq,lexemeTypes)
  }
  static Context(token) {
    return new Lexeme(lexemeTypes.context,token)
  }
}

module.exports = Lexeme