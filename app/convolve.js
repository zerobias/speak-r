const R = require('ramda')
const S = require('sanctuary')

const util = require('./util')

const P = util.P
const log = util.log('tree')
const pipelog = util.pipelog('tree')

const HeadList = require('./head-list.js')
const Lexeme = require('./lexeme.js')

const tool = require('./lang/tooling')


const eqOp = tool.eq.op
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
// const opCond = opVal => R.both(Lexeme.its.expr, P(util.prop.head,eqOp(opVal)))
const stateConds = {
  pipe:Lexeme.its.pipe,
  open:eqOp.backpipe,
  mid:eqOp.middlepipe,
  close:eqOp.forwardpipe
}
const stConds = R.append([R.T,states.pipe],R.map(e=>[stateConds[e],()=>states[e]],stateNames))

const switches = [
  [NaN,1,1,NaN,1], // empty
  [NaN,0,1,NaN,0], // pipe
  [NaN,-1,1,0,-1], // open
  [NaN,-1,1,0,-1], // mid
  [NaN,0,1,NaN,0]  // close
]
function optimise(data) {
  const exprToPipe = R.when(Lexeme.its.expr,P(util.prop.tail,e=>new HeadList(e), Lexeme.Pipe))
  const singlePipeToAtomic = R.when(R.both(Lexeme.its.pipe,P(HeadList.hasTail,R.not)),util.prop.head)
  return P(exprToPipe,singlePipeToAtomic)(data)
}
const appendTo = obj=>e=>obj.append(e)
function Stack() {
  this.value = []
  this.push = obj=>this.value.push(appendTo(obj))
  this.pushLast = result=>this.push(HeadList.lastR(result,true))
  this.pop = ()=>this.value.pop()
  this.addToLast = val=>R.last(this.value)(val)
}
function convolve(data) {
  if (!R.is(Array,data)) return S.Left('No array recieved')
  var result = HeadList.emptyList()
  let stack = new Stack()
  let state = states.empty
  let i = 0
  while(i<data.length) {
    var e = data[i]
    let nextState = R.cond(stConds)(e)
    let doAction = switches[state][nextState]
    switch(doAction) {
      case actions.child:
        stack.pushLast(result)
        break
      case actions.parent:
        stack.pop()
        break
    }
    state = nextState
    stack.addToLast(optimise(e))
    i++
  }
  return P(Lexeme.Pipe,optimise)(result)
}

module.exports = convolve