
var Stream = require('./stream');
var util = require('util');

var Queue = module.exports = function(options) {
  Stream.call(this);

  this.send = true;
  this.queue = [];
};
util.inherits(Stream, EventEmitter);

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
