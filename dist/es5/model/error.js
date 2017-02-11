'use strict';

var R = require('ramda');
var util = require('../util');
var isof = util;

function CustomError(message, data) {
  this.name = "CustomError";
  var objString = {
    onReal: 'Error with object',
    onNil: 'Error with undefined object'
  };
  var objectInfo = isof.Real(data) ? objString.onReal : objString.onNil;
  this.message = R.join('\n')([message, objectInfo, data]);

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor);
  } else {
    this.stack = new Error().stack;
  }
}

CustomError.prototype = Object.create(Error.prototype);
CustomError.prototype.constructor = CustomError;

module.exports = CustomError;