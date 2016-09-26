const R = require('ramda')
const debug = require('debug')

const RP = require('./model/ramda-piped')

const pipefy = require('./pipefy')
const P = pipefy

const isof = {
  String: R.is(String),
  Func:   R.is(Function),
  Array:  R.is(Array),
  Nil:    R.isNil,
  Real:   e=>!R.isNil(e),
  Empty:  R.isEmpty,
  Full:   e=>!R.isEmpty(e)
}

const tagvalue = (tag,mess)=>isof.Nil(mess) ? tag : [tag,mess].join(':  ')
const log = tag=>mess=>debug(tagvalue(tag,mess))
const pipelog = tag=>mess=>R.tap(log(tag)(mess))

const arrayify = R.pipe(R.defaultTo([]),R.unless(isof.Array,R.of))

// const P = (...pipes)=>R.apply(R.pipe,R.filter(isof.Func,pipes))


const isContainOrEq = P(arrayify,R.flip(R.contains))


const {create, env} = require('sanctuary')
const checkTypes = false//process.env.NODE_ENV !== 'production';
const S = create({checkTypes: checkTypes, env: env})

const prop = R.map(R.prop,{
  type: 'type',
  val:  'value',
  head: 'head',
  tail: 'tail',
  data: 'data'
})

const isString = isof.String

module.exports = {
  pipelog,log,isString,arrayify,P,isof,isContainOrEq,prop,RP,S
}