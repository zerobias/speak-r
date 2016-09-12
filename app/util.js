const R = require('ramda')
const debug = require('debug')

const RP = require('./ramda-piped')

const tagvalue = (tag,mess)=>R.isNil(mess) ? tag : [tag,mess].join(':  ')
const log = tag=>mess=>debug(tagvalue(tag,mess))
const pipelog = tag=>mess=>R.tap(log(tag)(mess))

const toPipe = R.apply(R.pipe)

const pRed = (acc,val)=>R.ifElse(R.is(Array),R.concat(acc),R.append(R.__,acc))(val)
const P = (...pipes)=>toPipe(R.reduce(pRed,[],pipes))

const arrayify = R.unless(R.is(Array),R.of)
const isContainOrEq = P(arrayify,R.flip(R.contains))

const isString = R.is(String)

const prop = {
  type:R.prop('type'),
  val:R.prop('value'),
  head:R.prop('head'),
  tail:R.prop('tail')
}
module.exports = {
  pipelog,log,isString,arrayify,toPipe,P,isContainOrEq,prop,RP
}