const { pipe, flatten, apply, unapply } = require('ramda')

const P =unapply(
  pipe(
    flatten,
    apply(
      pipe)))

module.exports = P