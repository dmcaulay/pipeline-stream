
var Stream = require('./stream');
var util = require('util');

var Queue = module.exports = function(options) {
  Stream.call(this, options);

  this.send = true;
  this.queue = [];
};
util.inherits(Queue, Stream);

Queue.prototype.write = function(data, meta) {
  if (this.send) {
    this.send = false;
    return this.emit('data', data, meta);
  }

  this.queue.push({data:data, meta:meta});
};

Queue.prototype.onDrain = function() {
  if (this.queue.length) {
    var item = this.queue.shift();
    return this.emit('data', item.data, item.meta);
  }
  this.send = true;
};
