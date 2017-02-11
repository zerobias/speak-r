Speak-r
==========
> Functional programming in human-readable form

Quickstart
----------
Speak-r - it's a [ramda](https://github.com/ramda/ramda) pipeline without using `R.(`.
Instead of writing unreadable pipelines full of syntax sugar you can simply write ramda methods like as if they were ordinary words

```js
const R = require('ramda')

const pipe = R.pipe(R.when(R.equals(1),R.add(10)),R.objOf('value'))
let result = pipe(1)
//=> { value: 11 }
```

```js
const say = require('speaker')
const pipe = say("when [ == 1 , + 10 ] objOf 'value'")

let result = pipe(1)
//=> { value: 11 }
```

Syntax
---

### Basic

Every expression is sequence of words separated by spaces, representing a functional pipe.
*[Lean more][@leanpipe] on functional pipes.*

Every ramda method can be written using the corresponding keyword.
All these ways are identical.
```javascript
const Say = require('speak-r')

let fn = Say`inc of`
    fn = R.pipe( R.inc, R.of )
    fn = num => R.of( R.inc(num) )

fn(0)
// => [ 1 ]
```

### Inline strings / numbers

Numbers are written as is, strings are enclosed in single quotes.
Based on the fact that ordinary variables are non-callable, every string, number or argument refers to the nearest preceding function.

```javascript
let fn = Say`add 10`

fn(0)
// => 10

fn = Say`objOf 'name'`

fn('Anna')
// => { name: 'Anna' }
```

A function can be followed by any number of arguments.

```javascript
const fn = Say`assoc 'age' 21`

fn({ name: 'Anna' })
// => { name: 'Anna', age: 21 }
```

Functions arguments are automatically grouped, so you can safely write functions successively.

```javascript
const isAdult = Say`prop 'age' lt 18`

isAdult({ name: 'Anna', age: 21 })
// => true
```

### Arguments

Often you want to send more than one argument.
Arguments can be listed at the beginning before `::` and then refer to their names as a value or as a function.

By default, the argument is used as a function. To refer to a variable, use symbol `@`

```javascript
const getHash = user => {
  user.hash = 4 // chosen by fair dice roll
                // guaranted to be random
  return user
}
const setBalance = Say`user money hashFunc :: assoc 'balance' @money hashFunc`

setBalance({ name: 'Anna', age: 21 }, 100, getHash)
// => { name: 'Anna', age: 21, balance: 100, hash: 4 }
```

[@leanpipe]: https://iamstarkov.com/fp-js-workshop/02-practical-intro/
