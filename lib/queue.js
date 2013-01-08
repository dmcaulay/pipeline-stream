
var Stream = require('./stream');
var util = require('util');

var Queue = module.exports = function(options) {
  Stream.call(this, options);

  this.send = true;
  this.queue = [];
};
util.inherits(Queue, Stream);

Queue.prototype.write = function(data) {
  if (this.send) {
    this.send = false;
    return this.emit('data', data);
  }

  queue.push(data);
};

Queue.prototype.onDrain = function() {
  if (queue.length) return this.emit(queue.shift());
  this.send = true;
};
