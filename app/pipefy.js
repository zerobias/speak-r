const R = require('ramda')

class Red {
  static add(acc,val) {
    return R.append(val,acc)
  }
  static forget(acc) {
    return acc
  }
  // static morph(morpher) {
  //   return function(acc,val) {
  //     return morpher(val,acc)
  //   }
  // }
  // static check(tests) {
  //   let passing = R.allPass(tests)
  //   return function(acc,val) {
  //     return passing(val)
  //       ? Red.add(acc,val)
  //       : Red.forget(acc,val)
  //   }
  // }
  constructor(reducer,acc=Red.add) {
    return R.transduce(reducer,acc,[])
  }
  static ucer(...reducers) {
    return new Red(R.compose(...reducers))
  }
}

const _filter = R.compose(
    R.flatten,
    R.map(R.when(R.is(Array),R.map(_P))),
    R.filter(R.is(Function))
)
const tr = new Red()
const accum = R.ifElse(R.is(Array),R.flip(R.concat),Red.add)
function _P(...pipes) {
  let filtered = _filter(pipes)
  return R.pipe(...filtered)
}

const filtP = R.either(R.is(Array),R.is(Function))

const P = new Red(R.filter(filtP),R.check)

function _P2(pipe1,pipe2,data) {
  return pipe2(pipe1(data))
}
const P2 = R.curry(_P2)

Object.defineProperty(_P,'P2',{value:P2})
Object.defineProperty(_P,'Red',{value:Red})
Object.defineProperty(_P,'toPipe',{value:funcs=>R.pipe(...funcs)})

module.exports = _P