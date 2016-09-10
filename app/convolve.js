const R = require('ramda')
const S = require('sanctuary')

const util = require('./util')

const P = util.P
const log = util.log('tree')
const pipelog = util.pipelog('tree')

const HeadList = require('./head-list.js')
const Lexeme = require('./lexeme.js')
const syntax = require('./syntax.js')

const types = syntax.type.dict
const op = syntax.op
const eq = type=>val=>R.whereEq({type:type,value:val})

const eqOp = eq(types.operator)
const stateNames = ['pipe','open','mid','close']
const states = {
  empty:0,
  pipe:1,
  open:2,
  mid:3,
  close:4
}
const actions = {
  next:0,
  child:1,
  parent:-1,
  error:NaN
}
const opCond = opVal => R.both(Lexeme.its.expr, P(R.prop('head'),eqOp(opVal)))
const stateConds = {
  pipe:Lexeme.its.pipe,
  open:opCond(op.backpipe),
  mid:opCond(op.middlepipe),
  close:opCond(op.forwardpipe)
}

const switches = [
  [NaN,1,1,NaN,1], // empty
  [NaN,0,1,NaN,0], // pipe
  [NaN,-1,1,0,-1], // open
  [NaN,-1,1,0,-1], // mid
  [NaN,0,1,NaN,0]  // close
]
function optimise(data) {
  const exprToPipe = R.when(Lexeme.its.expr,P(R.prop('tail'),e=>new HeadList(e), Lexeme.Pipe))
  const singlePipeToAtomic = R.when(R.both(Lexeme.its.pipe,P(HeadList.hasTail,R.not)),R.prop('head'))
  return P(exprToPipe,singlePipeToAtomic)(data)
}
function convolve(data) {
  let i = 0

  var result = HeadList.emptyList()
  const appendTo = obj=>e=>obj.append(e)
  const toResult = appendTo(result)
  const toLast = e=>(HeadList.lastR(result,true)).append(e)
  var stack = []
  const stackIn = obj=>stack.push(appendTo(obj))
  const stackInLast = ()=>stackIn(HeadList.lastR(result,true))
  const stackOut = ()=>stack.pop()
  const appendToLast = val=>R.last(stack)(val)
  let appender = toResult
  var state = states.empty
  const cond = R.cond([
    [stateConds.pipe,toResult],
    [stateConds.open,toLast],
    [R.T,R.F]
  ])
  const stConds = R.append([R.T,states.pipe],R.map(e=>[stateConds[e],()=>states[e]],stateNames))
  while(i<data.length) {
    var e = data[i]
    log('e')(e)
    let nextState = R.cond(stConds)(e)
    log('state before')(state)
    log('nextState')(nextState)
    let doAction = switches[state][nextState]
    switch(doAction) {
      case actions.child:
        stackInLast()
        break
      case actions.parent:
        stackOut()
        break
    }
    state = nextState
    log('state')(state)
    appendToLast(optimise(e))
    i++
  }
  return result
}

module.exports = convolve