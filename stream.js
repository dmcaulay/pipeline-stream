//
// inspired by node.js stream
//
// there is no concept of pause, resume, end or close 
// i've decided to remove them because i think they complicate the node.js
// stream class
//
// basic stream layout
// s - source
// q - queue
// m - mddleware
//
// s->q->m->q->m->...
//
// streams emit data when sending down the pipe and emit drain when they are 
// ready for more data. lets go over how this works for all 3 of the types.
//
// you'll see that the queue is it's own stream. i prefer this because it
// keeps the logic out of the middleware streams and makes it easy to move
// the queue out of memory to something like sqs or redis
//
// source:
// the source stream reads data as fast as it wants and sends it down the pipe.
// this stream doesn't need to emit drain because there is noone upstram.
//
// queue:
// queues receive data, but only emit data after their onDrain method is called. 
// there is one exception to this rule and that's at startup. we assume that
// the downstream stream can handle the first chunk of data before it calls drain.
//
// middleware:
// this is where everything interesting happens. most appication developers will
// only write middleware streams. they receive data do their job and emit new
// data to the downstream stream. they are also responsible for calling drain when they're
// done with the data.
//
// events:
// 'data' emitted to send data down the pipe
// 'drain' emitted to indicate the stream is done processing data
// 'error' emitted to indicate something went wrong while processing this chunk of
// data. as a convenience, when you pipe one stream to another stream we add a
// listener on the error event that automatically calls drain so the upstream
// queue knows to send more data.
// 'next' emitted to send data and emit the drain event
// 'noop' emitted to indicate the streram is ignoring this data and not sending
// it down the pipe
//
// options
// name: the name of the stream
// max: the max number of items to write in parallel
// reporter: an object used to report data, error,
// noop events
//
// methods
// pipe: same as node.js
// getStats: get an containing the current stats
// resetStats: reset the stats
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
  this.reporter = options.reporter;
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

    if (dest.reporter) dest.reporter.on('data', flow, data);

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

    if (dest.reporter) dest.reporter.on('noop', dest.name, info);
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
    info.err = err;
    if (dest.reporter) dest.reporter.on('error', dest.name, info);
  }
  dest.on('error', onError);

  // source should hook up other events by overriding pipe
  // dest should hook up other events through pipe event
  dest.emit('pipe', this);

  // Allow for unix-like usage: A.pipe(B).pipe(C)
  return dest;
};

