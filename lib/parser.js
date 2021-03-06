var Stream = require('./stream')
var util = require('util');

var Parser = module.exports = function(options) {
  Stream.call(this, options);
};
util.inherits(Parser, Stream);

Parser.prototype.write = function(data, meta) {
  try {
    var out = JSON.parse(data);
  } catch(err) {
    return this.emit('error', err, meta);
  }
  if (out.data && out.meta) return this.emit('next', out.data, out.meta);
  this.emit('next', out, meta);
};


