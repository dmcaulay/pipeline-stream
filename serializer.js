
var Stream = require('./stream');
var util = require('util');

var Serializer = module.exports = function(options) {
  Stream.call(this, options);
};
util.inherits(Serializer, Stream);

Serializer.prototype.write = function(data) {
  this.emit('next', JSON.stringify(data));
};

