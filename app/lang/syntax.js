const op = {
  doubledots:'::',
  comma:',',
  dash:'_',
  arrow:'->',
  doublearrow:'=>',
  backpipe:'<|',
  middlepipe:'<|>',
  forwardpipe: '|>',
  equals:'==',
  plus:'+',
  minus:'-',
  map:'^'
}
const types = {
  type:'type',
  R:'R',
  string:'string',
  number:'number',
  op:'operator',
  any:'any',
  context:'context',
  lex:'lexeme'
}
const jstypes = [
  ['Array', Array],
  ['Number', Number],
  ['String', String],
  ['Function', Function],
  ['Object', Object],
  ['Null', null],
  ['RegExp', RegExp]]
const quotes = ['"',"'",'`']
const categories = {
  piped:[types.R,types.context,types.lex],
  inserted:[types.number,types.string,types.type,types.any],
  control:[types.op]
}

module.exports = {op,types,quotes,categories,jstypes}