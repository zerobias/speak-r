const R = require('ramda')

const log = R.tap(console.log)

const tagLog = (...words)=>obj=>R.tap(R.pipe(R.flip(R.append)(words),R.apply(console.log)))(obj)
const pipeA = R.pipe(R.apply(R.pipe),R.map)
const trans = funcs=>R.transduce(pipeA(funcs), R.flip(R.append), [])

const filenames = ['|>splitter','index']

const moduleName = name=>['../app',name+'.js'].join('/')
const testName = name=>R.join('.')(['./'+name,'test','js'])
const morphs = [testName,moduleName]

const loaders = [
  R.pipe(R.map(require),e=>e[0](e[1])),
  require
]
const arrowPipes = [
  R.pipe(R.drop(2),R.of,R.juxt(morphs),loaders[0],tagLog('after loaders[0]')),
  R.pipe(testName,loaders[1],tagLog('after loaders[1]'))
]

const onCond = (cond,vars)=>R.apply(R.ifElse(cond),vars)

const isArrow = R.pipe(R.take(2),R.equals('|>'))

const onChecking = R.pipe(R.prepend(isArrow),R.apply(R.ifElse))
const pipeline = [onChecking(arrowPipes)]

trans(pipeline)(filenames)



// filenames.map(name=>require(testName(name)))