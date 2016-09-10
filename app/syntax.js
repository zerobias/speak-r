const R = require('ramda')

const types = ['type','R','string','number','operator','any','context','lexeme']
const typesDict = R.pipe(R.map(R.repeat(R.__,2)),R.fromPairs)(types)
const typeCats = {
  piped:[types.R,types.context,types.lexeme],
  inserted:[types.number,types.string,types.type,types.any],
  control:[types.operator]
}

const syntax = {
  pipe:'|>',
  toLast:'<-',
  quotes:['"',"'",'`'],
  operators:['=>','->',',','<~','<-','_','<|>','|>','<|','==','!=','@','::'],
  op:{
    doubledots:'::',
    comma:',',
    dash:'_',
    arrow:'->',
    doublearrow:'=>',
    backpipe:'<|',
    middlepipe:'<|>',
    forwardpipe: '|>'
  },
  type:{
    list:types,
    dict:typesDict,
    cats:typeCats
  }
}
module.exports = syntax