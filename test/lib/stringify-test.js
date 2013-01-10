var Stringify = require('../../lib/stringify')
var assert = require('assert')

var metadata = {meta:'data'}

describe('stringify', function() {
  it('stringifies objects', function(done) {
    var stream = new Stringify({config: 'stringify-test'})
    stream.on('next', function(data, meta) {
      assert.equal(data, '{"data":{"hello":"world"},"meta":{"meta":"data"}}')
      assert.deepEqual(meta, metadata)
      done()
    })
    stream.write({hello:'world'}, metadata)
  })
  it('adds the delimiter', function(done) {
    var stream = new Stringify({config: 'stringify-test', delimiter: '\n'})
    stream.on('next', function(data) {
      assert.equal(data, '{"hello":"world"}\n')
      done()
    })
    stream.write({hello:'world'})
  })
  it('emits errors', function(done) {
    var stream = new Stringify({config: 'stringify-test', delimiter: '\n'})
    stream.on('error', function(err, meta) {
      assert(err)
      assert.deepEqual(meta, metadata)
      done()
    })
    var obj = {hello:'world'}
    obj.circular = obj
    stream.write(obj, metadata)
  })
})
