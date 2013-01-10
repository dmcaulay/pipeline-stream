
var assert = require('assert')
var EventEmitter = require('events').EventEmitter
var pipelineStream = require('../')

describe('pipeline-stream', function() {
  it('exports all classes', function() {
    assert(pipelineStream.Stream)
    assert(pipelineStream.Array)
    assert(pipelineStream.Parser)
    assert(pipelineStream.Pick)
    assert(pipelineStream.Queue)
    assert(pipelineStream.StreamedParser)
    assert(pipelineStream.Stringify)
    assert(pipelineStream.Transform)
    assert(pipelineStream.nodeWritable)
  })
  describe('nodeWritable', function() {
    it('sets writable to true', function() {
      var obj = new EventEmitter()
      assert(pipelineStream.nodeWritable(obj).writable)
    })
    it('emitting next emits the data event', function(done) {
      var obj = new EventEmitter()
      pipelineStream.nodeWritable(obj)
      var metadata = {meta: 'data'}
      obj.on('data', function(data, meta) {
        assert.equal(data, 'test')
        assert.deepEqual(meta, metadata)
        done()
      })
      obj.emit('next', 'test', metadata)
    })
  })
})
