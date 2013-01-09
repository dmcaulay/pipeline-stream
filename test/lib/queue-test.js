var Queue = require('../../lib/queue')
var assert = require('assert')

var metadata = {meta:'data'}
var stream = new Queue({name:'queue-test'})

describe('queue', function() {
  it('dequeues the first item immediately', function(done) {
    stream.once('data', function(data, meta) {
      assert.equal(data, 'test1')
      assert.deepEqual(meta, metadata)
      done()
    })
    stream.write('test1', metadata)
  })
  it('waits for an onDrain call before dequeuing the second item', function(done) {
    var drained = false
    stream.once('data', function(data, meta) {
      assert(drained)
      assert.equal(data, 'test2')
      assert.deepEqual(meta, metadata)
      done()
    })
    stream.write('test2', metadata)
    assert.equal(stream.queue.length, 1)
    process.nextTick(function() { 
      drained = true
      stream.onDrain() 
    })
  })
})
