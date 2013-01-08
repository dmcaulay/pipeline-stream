var Parser = require('jsonparse')
var Stream = require('./stream')
var util = require('util');

var ParserStream = module.exports = function(options) {
  Stream.call(this, options);
  this.parser = new Parser();

  var stream = this;
  this.parser.onError = function(err) {
    stream.emit('error', err)
  };
  this.parser.onValue = function(value) {
    if (this.stack.length === 0) {
      stream.emit('next', value);
    }
  };
};
util.inherits(ParserStream, Stream);

ParserStream.prototype.write = function(data) {
  this.parser.write(data);
};
