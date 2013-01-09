var ArrayStream = require('../../lib/array')
var assert = require('assert')

var metadata = {meta:'data'}

describe('array stream', function() {
  it('emits a data event for each array item on a write call', function(done) {
    var array = [1,2,3,4,5]
    var index = 0
    var stream = new ArrayStream({config: 'array-test'})
    stream.on('data', function(data, meta) {
      assert.equal(data, array[index++])
      assert.deepEqual(meta, metadata)
    })
    stream.on('drain', function() {
      assert.equal(index, array.length)
      done()
    })
    stream.write(array, metadata)
  })
  it('emits errors', function(done) {
    var stream = new ArrayStream({config: 'array-test'})
    stream.on('error', function(err, meta) {
      assert(err)
      assert.deepEqual(meta, metadata)
      done()
    })
    stream.write('not an array', metadata)
  })
})
