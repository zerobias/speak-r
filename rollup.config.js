import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'
import cleanup from 'rollup-plugin-cleanup'
// import buble from 'rollup-plugin-buble'
import multiEntry from 'rollup-plugin-multi-entry'
import uglify from 'rollup-plugin-uglify'
import { minify } from 'uglify-js'
import babel from 'rollup-plugin-babel'

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
    format: 'umd',
    moduleName: 'speaker',
    sourceMap: true
  }]
}

export default {
  entry: isES5Build
    ? ['babel-polyfill','app/index.js']
    : 'app/index.js',
  globals: {
    "ramda": "R",
    "sanctuary": "sanctuary",
    "debug": "debug"
  },
  plugins: [
    isES5Build
      ? multiEntry({ exports: false })
      : '',
    cleanup(),

    nodeResolve({
      jsnext: true,
      main: false,
      module: true,
      skip: true,
      preferBuiltins: false
    }),
    commonjs({
      include: ['app/**'],
      // exclude: ['node_modules/**'] //'node_modules/**',
      // namedExports: { './module.js': ['foo', 'bar' ] }  // Default: undefined
    }),
    isES5Build
      //? buble()
      ? babel({
        exclude: 'node_modules/**',
        runtimeHelpers: true
      })
      :'',

    // isES5Build
    //   ? uglify({}, minify) :''
  ],
  external: external,
  targets: isES5Build?targets.es5:targets.esnext
}