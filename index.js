
module.exports = {
  Stream: require('./lib/stream'),
  Array: require('./lib/array'),
  Parser: require('./lib/parser'),
  Pick: require('./lib/pick'),
  Queue: require('./lib/queue'),
  StreamedParser: require('./lib/streamedParser'),
  Stringify: require('./lib/stringify'),
  Transform: require('./lib/transform'),
  nodeWritable: function(stream) {
    stream.writable = true;
    stream.on('next', function(data, meta) {
      stream.emit('data', data, meta)
    })
    return stream;
  }
};
