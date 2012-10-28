
var Stream = require('./stream');
var Parser = require('jsonparse');
var util = require('util');

var Deserializer = module.exports = function(options) {
  Stream.call(this, options);

  var stream = this;
  var parser = new Parser();
  parser.onValue = function(value) {
    if (!this.stack.length) stream.emit('data', value);
  };
  parser.onError = function(err) {
    this.emit('error', err);
  };
  process.stdin.on('data', function(chunk) {
    parser.write(chunk);
  });
};
util.inherits(Deserializer, Stream);
