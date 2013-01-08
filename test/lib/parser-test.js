var Parser = require('../../lib/parser')
var assert = require('assert')

describe('parser', function() {
  it('emits next for each object it parses', function(done) {
    var count = 0
    var stream = new Parser({config: 'parser-test'})
    stream.on('next', function(data) {
      assert.deepEqual({hello:'world'},data)
      count++
      if (count === 2) done()
    })
    stream.write('{"hello":"world"}{"hello":"world"}')
  })
  it('emits errors', function(done) {
    var stream = new Parser({config: 'parser-test'})
    stream.on('error', function(err) {
      assert(err)
      done()
    })
    stream.write('}')
  })
})
