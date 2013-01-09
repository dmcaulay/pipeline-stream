
var assert = require('assert')
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
      var obj = {}
      assert(pipelineStream.nodeWritable(obj).writable)
    })
  })
})
