
var Stream = require('./stream');
var util = require('util');
var net = require('net');

var In = module.exports = function(options) {
  Stream.call(this, options);

  net.createServer(function (c) {
    c.pipe(this);
  }.bind(this)).listen(options.port);
};
util.inherits(In, Stream);

