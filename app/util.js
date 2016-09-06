const R = require('ramda')
const debug = require('debug')
const addMessage = R.ifElse(R.complement(R.isNil),e=>R.pipe(R.of,R.prepend(e)),e=>R.identity)

const tagvalue = (tag,mess)=>R.isNil(mess) ? tag : [tag,mess].join(':  ')
const log = tag=>mess=>debug(tagvalue(tag,mess))
const pipelog = tag=>mess=>R.tap(log(tag)(mess))

const consoleOpts = { console:{color:true} }
// const logmodule = tag=>bucker.createLogger(consoleOpts,tag)

const arrayify = R.when(R.complement(R.is(Array)),R.of)

const toPipe = R.apply(R.pipe)

const isString = R.is(String)
module.exports = {
  pipelog,log,isString,arrayify,toPipe
}