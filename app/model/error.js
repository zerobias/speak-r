const R = require('ramda')
const util = require('../util')
const isof = util.isof
const P = util.P

function CustomError(message, data) {
  this.name = 'CustomError'
  // const objString = {
  //   onReal:'Error with object',
  //   onNil:'Error with undefined object'
  // }
  // let objectInfo = isof.Real(data)
  //   ? objString.onReal
  //   : objString.onNil
  this.message = join.msg([message, data])

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor)
  } else {
    this.stack = (new Error()).stack
  }
}

CustomError.prototype = Object.create(Error.prototype)
CustomError.prototype.constructor = CustomError

const join = {
  msg    : R.join(': '),
  newline: R.join('\n'),
  space  : R.join(' '),
  clear  : R.join(''),
  comma  : R.join(', ')
}
const keyValJoint = P(
  R.map(P(
    R.toPairs,
    R.map(join.msg),
    join.comma,
    e => join.space(['{', e, '}']))),
  join.newline)
const countsMessage = message => data => R.ifElse(e => e.length>1, () => `${message}s`, () => message)(data)

class TokenError extends CustomError {
  static get message() {
    return countsMessage(`unknown token`)
  }
  constructor(data) {
    super(TokenError.message(data), (data))
    this.name = 'TokenError'
  }
}
class ArgumentsTypeError extends CustomError {
  static get message() {
    return countsMessage(`call non-function argument`)
  }
  constructor(data) {
    super(ArgumentsTypeError.message(data), keyValJoint(data))
    this.name = 'ArgumentsTypeError'
  }
}
class LexicError extends CustomError {
  static get message() {
    return P(
      R.converge(R.of, [R.pluck('error'), R.pluck('data')]),
      R.map(join.comma))
  }
  constructor(data) {
    super(LexicError.message(data), keyValJoint(R.pluck('data', data)))
    this.name = 'LexicError'
  }
}
function errorCheck(Err) {
  return function(data) {
    const failed = util.S.lefts(data)
    if (!R.isEmpty(failed))
      throw new Err(failed)
  }
}
CustomError.Throw = {
  Token: errorCheck(TokenError),
  Args : e => {throw new ArgumentsTypeError(e)},
  Lexic: errorCheck(LexicError)
}

module.exports = CustomError