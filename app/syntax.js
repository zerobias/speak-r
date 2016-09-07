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
  types:['type','R','string','number','operator','any','context','lexeme']
}
module.exports = syntax