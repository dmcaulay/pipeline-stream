var Stream = require('./stream')
var util = require('util');

var Pick = module.exports = function(options) {
  Stream.call(this, options);
  this.field = options.field;
};
util.inherits(Pick, Stream);

Pick.prototype.write = function(data, meta) {
  if (!data[this.field]) return this.emit('noop', meta)
  this.emit('next', data[this.field], meta)
};

