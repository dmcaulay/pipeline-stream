//
// inspired by node.js stream
//
// there is no concept of pause, resume, end or close 
// i've decided to remove them because i think they complicate the node.js
// stream class
//
// control flow is currently implemented with the drain event.
// any stream that implements control flow waits for the drain event
// before sending data down the pipe. all other streams ignore the drain
// event and emit it on a next, error or noop event
//
// we have a few different stream types to think about
// 1) all streams
//   - emit 'error' when there is an error
//     - all streams assume that an error means you had an issue handling data
//     - this means you dropped the data and you're ready for more
//     - you can see that the on error method emits 'drain'
// 2) control flow stream (usually a queue)
//   - in this case you're always willing to accept data so you always
//     emit drain in the onData method
//   - you implement onDrain. this gets called when you can send
//     more data down the pipe
//   - you call emit('data') when you send data down the pipe
// 3) normal stream
//   - you emit('next', data) when you're done and ready to send data down the pipe
//   - you emit('noop') if you need more data before sending anything down the pipe
//     - filter or batch job
//   - you allow max number of items to queue up by calling source.onDrain in the
//     onData method while count < max
//   - on the drain event you decrement count and call source.onDrain if count < max
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

    if (dest.onDrain) {
      // always drain if control flow stream
      dest.emit('drain');
    } else if (source.onDrain) {
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

    if (dest.reporter) dest.reporter.on('noop', flow, info);
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
    if (dest.reporter) dest.reporter.on('error', flow, info);
  }
  dest.on('error', onError);

  // source should hook up other events by overriding pipe
  // dest should hook up other events through pipe event
  dest.emit('pipe', this);

  // Allow for unix-like usage: A.pipe(B).pipe(C)
  return dest;
};

