var Stream = require('./stream')
var util = require('util');

var Transform = module.exports = function(options) {
  Stream.call(this, options);
  this.fields = options.fields;
};
util.inherits(Transform, Stream);

Transform.prototype.write = function(data, meta) {
  var output = {}
  Object.keys(this.fields).forEach(function(field) {
    if (!data[field]) return
    var value = data[field]
    var transform = this.fields[field].transform
    var outputField = this.fields[field].output !== undefined ? this.fields[field].output : field
    var transformed = transform ? transform(value, output) : value
    if (outputField) output[outputField] = transformed 
  }.bind(this))
  this.emit('next', output, meta);
};

