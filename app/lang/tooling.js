const R = require('ramda')

const util = require('../util')
const P = util.P

const syntax = require('./syntax')
const types = syntax.types
const op = syntax.op

const checkToken = type => val => R.whereEq({ type: type, value: val })
const checkOper = checkToken(types.op)
const checkType = R.propEq('type')

const def = (func, obj) => prop =>
  Object.defineProperty(obj, prop[0], {
    get: function(){
      func(prop[1])
      return obj} })
function polymorph(store) {
  return function ins(val) {
    return R.ifElse(R.either(R.isNil, () => R.isEmpty(store)), () => ins, R.anyPass(store))(val)
  }
}
const appender = store => val => store.push(val)
const setter = (store, ins, dict) => P(
  R.toPairs,
  R.forEach(
    def(appender(store), ins)))(dict)
function storage(dict) {
  const store = []
  const ins = polymorph(store)
  Object.defineProperty(ins, 'store', { get: function(){return store} })
  setter(store, ins, dict)
  return ins
}

const eq = {
  op      : R.map( checkOper )(op),
  type    : R.map( checkType )(types),
  typedVal: R.map( checkToken )(types)
}

const equals = {}
Object.defineProperty(equals, 'op', { get: function(){return storage(eq.op)} })
Object.defineProperty(equals, 'type', { get: function(){return storage(eq.type)} })
Object.defineProperty(equals, 'typedVal', { get: function(){return storage(eq.typedVal)} })



module.exports = { eq, equals }