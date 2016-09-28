'use strict';

var op = {
  doubledots: '::',
  comma: ',',
  dash: '_',
  arrow: '->',
  doublearrow: '=>',
  middlepipe: '<|>',
  backpipe: '<|',
  forwardpipe: '|>',
  equals: '==',
  plus: '+',
  minus: '-',
  map: '[^]',
  define: ':='
};
var types = {
  type: 'type',
  R: 'R',
  string: 'string',
  number: 'number',
  op: 'operator',
  any: 'any',
  context: 'context',
  lex: 'lexeme',
  F: 'contextF',
  arg: 'argument'
};
var jstypes = [['Array', Array], ['Number', Number], ['String', String], ['Function', Function], ['Object', Object], ['Null', null], ['RegExp', RegExp]];
var quotes = ['"', "'", '`'];
var categories = {
  piped: [types.R, types.context, types.lex],
  inserted: [types.number, types.string, types.type, types.any],
  control: [types.op]
};
var lexemeTypes = {
  pipe: 'Pipe',
  context: 'Context',
  atomic: 'AtomicFunc',
  expr: 'Expression',
  arg: 'Argument'
};
module.exports = { op: op, types: types, quotes: quotes, categories: categories, jstypes: jstypes, lexemeTypes: lexemeTypes };