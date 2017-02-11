const R = require('ramda')

const util = require('../util')
const S = util.S
const P = util.P

const tool = require('../lang/tooling')
const eq = tool.equals

const DlinkList = require('../model/double-linked')
const Err = require('../model/error')

const chain = func => e => e.chain(func)
function testing(rejectFunc) {
  const testPack = tests => P(R.juxt(util.arrayify(tests)), R.all(R.equals(true)))
  const curryTestPack = tests => e => data => testPack(tests)(e, data)
  const over = (_list, morpher) => node => R.over(node.lens, morpher(_list, node))
  const onCatch = (tester, overrider) => node => R.when(tester(node), overrider(node))
  const checkNode = tester => morpher => _list => {
    const overrider = over(_list, morpher)
    const catcher = onCatch(tester, overrider)
    return (_data, node) => catcher(node)(_data)
  }
  const testsPipe = P(curryTestPack, checkNode)
  const recompose = (rejectFunc, testlist) => P(rejectFunc, testsPipe(testlist))
  return (testName, testlist) => recompose(rejectFunc, testlist)(testName)
}

function prepareValidation(testKit) {
  const leftErrorGen = errorText => o => S.Left({ error: errorText, data: o })
  const errorGen = rejectFunc => P(leftErrorGen, chain, rejectFunc)
  const changeRejected = (onError) => (_list, listNode) => e => {
    DlinkList.remove(_list, listNode)
    return onError(e)
  }
  const testingFactory = P(errorGen, testing)(changeRejected)
  const testingRun = P(R.toPairs, R.map(e => testingFactory(...e)), P)
  return testingRun(testKit)
}
function iterduce(testFunc) {
  return function(data) {
    const list = DlinkList.create(data)
    return errorSummary(R.reduce(testFunc(list), data, list))
  }
}
function errorSummary(data) {
  Err.Throw.Lexic(data)
  return S.rights(data)
}

const isInsertCatTest = (e, _data) => e.getter(_data).chain(eq.type.number.string.type.any.arg)
const siblingTest = (e, _data) => e.isFirst

const testKit = {
  siblingFilter: [isInsertCatTest, siblingTest]
}

const project = prepareValidation(testKit)

module.exports = iterduce(project)