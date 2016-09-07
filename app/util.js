const R = require('ramda')
const debug = require('debug')
const addMessage = R.ifElse(R.complement(R.isNil),e=>R.pipe(R.of,R.prepend(e)),e=>R.identity)

const tagvalue = (tag,mess)=>R.isNil(mess) ? tag : [tag,mess].join(':  ')
const log = tag=>mess=>debug(tagvalue(tag,mess))
const pipelog = tag=>mess=>R.tap(log(tag)(mess))

const consoleOpts = { console:{color:true} }

const arrayify = R.unless(R.is(Array),R.of)

const toPipe = R.apply(R.pipe)

const pRed = (acc,val)=>R.ifElse(R.is(Array),R.concat(acc),R.append(R.__,acc))(val)
const P = (...pipes)=>toPipe(R.reduce(pRed,[],pipes))

const isString = R.is(String)
module.exports = {
  pipelog,log,isString,arrayify,toPipe,P
}