
var Stream = require('./stream');
var util = require('util');
var net = require('net');

var Out = module.exports = function(options) {
  Stream.call(this, options);

  net.connect(options).pipe(this);
};
util.inherits(Out, Stream);

