import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'
import cleanup from 'rollup-plugin-cleanup'
import buble from 'rollup-plugin-buble'
import uglify from 'rollup-plugin-uglify'
import { minify } from 'uglify-js'

let pkg = require('./package.json')
let external = Object.keys(pkg.dependencies)

const isES5Build = process.env.BUILD === 'es5'

const targets = {
  es5:[{
    dest: pkg['main'],
    format: 'umd',
    moduleName: 'speaker',
    sourceMap: true
  }],
  esnext:[{
    dest: pkg['jsnext:main'],
    format: 'es',
    moduleName: 'speaker',
    sourceMap: true
  }]
}

export default {
  entry: 'app/index.js',
  globals: {
    "ramda": true,
    "sanctuary": true,
    "debug": true
  },
  plugins: [
    nodeResolve({
      jsnext: true,
      main: false,
      module: true,
      skip: true,
      preferBuiltins: true
    }),
    commonjs({
      include: ['app/**'],
      // exclude: ['node_modules/**'] //'node_modules/**',
      // namedExports: { './module.js': ['foo', 'bar' ] }  // Default: undefined
    }),
    cleanup(),
    isES5Build
      ? buble() :'',
    isES5Build
      ? uglify({}, minify) :''
  ],
  external: external,
  targets: isES5Build?targets.es5:targets.esnext
}