const R = require('ramda')

const def = (func, obj) => prop =>
  Object.defineProperty(obj, prop[0], {
    get: function(){
      func(prop[1])
      return obj} })
const appender = _store => val => _store.push(val)
const setter = (store, ins, dict) => R.pipe(R.toPairs, R.forEach(def(appender(store), ins)))(dict)
function polymorph(store) {
  // Doesnt understand wtf is going on here, but seem like this check never fall

  // const inputCheck = (argsArr,_store)=>
  //   !R.isEmpty(argsArr)
  //   &&!R.is(Function,argsArr[0])&&
  //   R.none(R.isNil,argsArr)
  //   &&!R.isEmpty(_store)
  return function ins(...val) {
    // if (inputCheck(val,store)) {
    store.push(store.pop()(...val))
    // }
    return ins
  }
}
function storage(dict) {
  const store = []
  const ins = polymorph(store)
  Object.defineProperty(ins, 'store', { get: function(){return store} })
  Object.defineProperty(ins, 'run', { get: function() {return R.pipe(...store)} })
  setter(store, ins, dict)
  return ins
}
const RP = {}
Object.defineProperty(RP, 'do', { get: function(){return storage(R)} })



module.exports = () => RP.do