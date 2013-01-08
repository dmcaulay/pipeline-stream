//
// inspired by node.js stream
//
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var Stream = module.exports = function(options) {
  EventEmitter.call(this);

  function onError(err) {
    this.errors++;
    if (this.listeners('error').length === 1) throw err;
  }
  this.on('error', onError);

  this.name = options.name;
  this.count = 0;
  this.max = options.max || 1;
  this.debug = options.debug;
  this.resetStats();
};
util.inherits(Stream, EventEmitter);

Stream.prototype.resetStats = function() {
  this.datas = 0;
  this.writes = 0;
  this.nexts = 0;
  this.errors = 0;
  this.drains = 0;
  this.noops = 0;
};

Stream.prototype.getStats = function() {
  return {
    datas: this.datas,
    count: this.count,
    writes: this.writes,
    nexts: this.nexts,
    noops: this.noops,
    drains: this.drains,
    errors: this.errors
  };
}

Stream.prototype.pipe = function(dest) {
  var source = this;
  var flow = source.name + '->' + dest.name;

  function onData(data) {
    dest.write(data);

    dest.count++;
    dest.writes++;
    source.datas++;

    if (dest.debug) dest.debug.emit('data', flow, data);

    if (source.onDrain) {
      // allow the source to queue up max number of
      // items to flow down the pipe
      if (dest.count < dest.max) source.onDrain();
    }
  }
  source.on('data', onData);

  function onNext(data) {
    // stream is done processing data and sending it down the pipe
    dest.emit('drain');
    dest.emit('data', data);
    dest.next++;
  }
  dest.on('next', onNext);

  function onNoop(info) {
    // stream decided not sending this data down the pipe
    dest.emit('drain');
    dest.noops++;

    if (dest.debug) dest.debug.emit('noop', dest.name, info);
  }
  dest.on('noop', onNoop);

  function onDrain() {
    // stream is done processing data
    dest.count--;
    dest.drains++;
    if (source.onDrain) {
      if (dest.count < dest.max) source.onDrain();
    }
  }
  dest.on('drain', onDrain);

  function onError(err, info) {
    // we assume that an error means that you
    // couldn't send data downstream so we emit a drain
    // event
    dest.emit('drain');
    if (info) info.err = err;
    else info = {err: err};
    if (dest.debug) dest.debug.emit('error', dest.name, info);
  }
  dest.on('error', onError);

  // source should hook up other events by overriding pipe
  // dest should hook up other events through pipe event
  dest.emit('pipe', this);

  // Allow for unix-like usage: A.pipe(B).pipe(C)
  return dest;
};

