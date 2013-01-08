var ArrayStream = require('../../lib/array')
var assert = require('assert')

describe('array stream', function() {
  it('emits a data event for each array item on a write call', function(done) {
    var array = [1,2,3,4,5]
    var index = 0
    var stream = new ArrayStream({config: 'array-test'})
    stream.on('data', function(data) {
      assert.equal(data, array[index++])
    })
    stream.on('drain', function() {
      assert.equal(index, array.length)
      done()
    })
    stream.write(array)
  })
  it('emits errors', function(done) {
    var stream = new ArrayStream({config: 'array-test'})
    stream.on('error', function(err) {
      assert(err)
      done()
    })
    stream.write('not an array')
  })
})
