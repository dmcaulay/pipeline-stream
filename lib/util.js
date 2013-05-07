var Stream = require('./stream')
var util = require('util')

var SimpleStream = function(options) {
  Stream.call(this, options)
  this.func = options.func
  this.argCount = this.func.length
  if (this.argCount < 1 || this.argCount > 3) throw new Error("Creating SimpleStream with invalid arg count:" + this.argCount)
}
util.inherits(SimpleStream, Stream)

SimpleStream.prototype.write = function(data, meta) {
  var func
  if (this.argCount === 1) {
    func = this.func.bind(this)
  } else if (this.argCount === 2) {
    func = this.func.bind(this, data)
  } else {
    func = this.func.bind(this, data, meta)
  }
  func(function(err, new_data, new_meta) {
    if (err) return this.emit('error', err)
    this.emit('next', new_data, new_meta || meta)
  }.bind(this))
}

module.exports = {
  SimpleStream: SimpleStream,
  toStream: function(func, options) {
    options.func = func
    return new SimpleStream(options)
  }
}
