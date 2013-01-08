var Stream = require('./stream')
var util = require('util');

var Stringify = module.exports = function(options) {
  Stream.call(this, options);
  this.delimiter = options.delimiter;
};
util.inherits(Stringify, Stream);

Stringify.prototype.write = function(data, meta) {
  try {
    var out = JSON.stringify(data);
  } catch(err) {
    return this.emit('error', err);
  }
  if (this.delimiter) out += this.delimiter;
  this.emit('next', out, meta)
};


