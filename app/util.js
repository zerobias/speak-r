const { is, isNil, isEmpty, tap, pipe, defaultTo, unless, of, flip, contains, map, prop, complement } = require('ramda')
const debug = require('debug')

const RP = require('./model/ramda-piped')

const pipefy = require('./pipefy')
const P = pipefy

const isof = {
  String: is(String),
  Func  : is(Function),
  Array : is(Array),
  Nil   : isNil,
  Real  : complement(isNil),
  Empty : isEmpty,
  Full  : complement(isEmpty)
}

const tagvalue = (tag, mess) => isof.Nil(mess)
  ? tag
  : [tag, mess].join(':  ')
const log = tag => mess => debug(tagvalue(tag, mess))
const pipelog = tag => mess => tap(log(tag)(mess))

const arrayify = pipe(defaultTo([]), unless(isof.Array, of))

// const P = (...pipes)=>apply(pipe,filter(isof.Func,pipes))


const isContainOrEq = P(arrayify, flip(contains))


const { create, env } = require('sanctuary')
const checkTypes = false//process.env.NODE_ENV !== 'production';
const S = create({ checkTypes: checkTypes, env: env })

const syntaxProp = map(prop, {
  type: 'type',
  val : 'value',
  head: 'head',
  tail: 'tail',
  data: 'data'
})

const isString = isof.String

module.exports = {
  pipelog, log, isString, arrayify, P, isof, isContainOrEq, prop: syntaxProp, RP, S
}