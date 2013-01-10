var Parser = require('../../lib/parser')
var assert = require('assert')

var metadata = {meta:'data'}

describe('parser', function() {
  it('parses objects', function(done) {
    var stream = new Parser({config: 'parser-test'})
    stream.on('next', function(data, meta) {
      assert.deepEqual(data, {hello:'world'})
      assert.deepEqual(meta, metadata)
      done()
    })
    stream.write('{"hello":"world"}', metadata)
  })
  it('splits data and meta if they exist', function(done) {
    var stream = new Parser({config: 'parser-test'})
    stream.on('next', function(data, meta) {
      assert.deepEqual(data, {hello:'world'})
      assert.deepEqual(meta, metadata)
      done()
    })
    stream.write('{"data":{"hello":"world"},"meta":{"meta":"data"}}')
  })
  it('emits errors', function(done) {
    var stream = new Parser({config: 'parser-test'})
    stream.on('error', function(err, meta) {
      assert(err)
      assert.deepEqual(meta, metadata)
      done()
    })
    stream.write('}', metadata)
  })
})
