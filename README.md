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
const pipe = say("when <| == 1 <|> + 10 |> objOf 'value'")

let result = pipe(1)
//=> { value: 11 }
```