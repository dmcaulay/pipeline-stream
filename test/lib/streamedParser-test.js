var Parser = require('../../lib/streamedParser')
var assert = require('assert')

var metadata = {meta:'data'}

describe('parser', function() {
  it('emits next for each object it parses', function(done) {
    var count = 0
    var stream = new Parser({config: 'parser-test'})
    stream.on('next', function(data, meta) {
      assert.deepEqual({hello:'world'},data)
      assert.deepEqual(meta, metadata)
      count++
      if (count === 2) done()
    })
    stream.write('{"hello":"world"}{"hello":"world"}', metadata)
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
