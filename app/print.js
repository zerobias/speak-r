const R = require('ramda')
const S = require('sanctuary')

const util = require('./util')

const P = util.P
const log = util.log('tree')
const pipelog = util.pipelog('tree')

const HeadList = require('./head-list.js')

class Print {
  static _indexTag(tag) {
    return (e,separ=' ')=>P(util.arrayify,R.prepend(tag),R.join(separ),log)(e)
  }
  static arr(tag,arr){
    let iTag = Print._indexTag(tag)
    return arr.forEach((e,i)=>iTag(i)(e))
  }
  static get funcReplace() {return R.when(P(R.last,R.is(Function)),e=>[e[0],'FUNC'])}
  static get pair(){
    return P(R.toPairs,R.map(Print.funcReplace()))}
  static to(func) {return P(S.maybeToNullable,func)}
  static get typeOrOper() {return R.ifElse(isOperator,prop.val,prop.type)}
  static headList(tag,data,index=0,level=0) {
    const iTag = Print._indexTag(tag)
    const padd = '   '
    const joinPadd = P(R.repeat(padd),R.join(''))
    const objKeys = ['value']
    const keyValPrint = padding=>e=>iTag(['  ',joinPadd(level),padding,e[0]],'')(e[1])
    const tokenPrint = keys=>P(R.props(keys),R.zip(keys),R.forEach(keyValPrint(padd)))
    const isRealIndex = i=>i===-1?'#  ':i+1+((i+1)>=10?' ':'  ')
    const nextLevel = R.add(2,level)
    if (HeadList.isList(data)) {
      keyValPrint(isRealIndex(index))([data.lexeme,data.index])
      Print.headList(tag,data.head,-1,nextLevel)
      if (HeadList.hasTail(data))
        data.tail.forEach((e,i)=>Print.headList(tag,e,i,nextLevel))
    } else {
      keyValPrint(isRealIndex(index))([data.type,data.index])
      tokenPrint(objKeys)(data)
    }
  }
}

module.exports = Print