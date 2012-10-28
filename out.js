
var Stream = require('./stream');
var util = require('util');

var Out = module.exports = function(options) {
  Stream.call(this, options);
};
util.inherits(Out, Stream);

Out.prototype.write = function(data) {
  process.stdout.write(JSON.stringify(data));
  this.emit('drain');
};

