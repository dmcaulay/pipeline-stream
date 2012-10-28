//
// inspired by node.js stream
//
// there is no concept of pause, resume, end or close 
// i've decided to remove them because i think it complicates the base
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
//   - you call emit('next', data) when you're done and ready to send data down the pipe
//   - you call emit('noop') if you need more data before sending anything down the pipe
//     - filter or batch job
//   - you allow max number of items to queue up by calling source.onDrain in the
//     onData method while count < max
//   - on the drain event you decrement count and call source.onDrain if count < max
//
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var Stream = module.exports = function(options) {
  EventEmitter.call(this);

  this.name = options.name;
  this.count = 0;
  this.max = options.max || 1;
  this.resetStats();
};
util.inherits(Stream, EventEmitter);

Stream.prototype.pipe = function(dest) {
  var source = this;

  function onData(data) {
    dest.write(data);
    dest.count++;
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
  }
  dest.on('next', onNext);

  function onNoop() {
    // stream decided not sending this data down the pipe
    dest.emit('drain');
  }
  dest.on('noop', onNoop);

  function onDrain(internal) {
    // stream is done processing data
    dest.count--;
    if (source.onDrain) {
      if (dest.count < dest.max) source.onDrain();
    }
  }
  dest.on('drain', onDrain);

  function onError(err) {
    // we assume that an error means that you
    // couldn't send data downstream so we emit a drain
    // event
    dest.emit('drain');
  }
  dest.on('error', onError);

  // source should hook up other events by overriding pipe
  // dest should hook up other events through pipe event
  dest.emit('pipe', this);

  // Allow for unix-like usage: A.pipe(B).pipe(C)
  return dest;
};

