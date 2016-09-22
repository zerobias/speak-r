const R = require('ramda')
const types = require('../lang/syntax').types

const TokenFabric = R.curry((category,obj)=>{
  return {
    type:category,
    value:obj
  }
})

module.exports = R.map(e=>TokenFabric(types[e]),{
  Type      :'type',
  R         :'R',
  String    :'string',
  Number    :'number',
  Operator  :'op',
  Any       :'any',
  Context   :'context',
  Arg       :'arg'
})