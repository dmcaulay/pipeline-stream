
var assert = require('assert')
var pipelineStream = require('../')

describe('pipeline-stream', function() {
  it('exports all classes', function() {
    assert(pipelineStream.Stream)
    assert(pipelineStream.Array)
    assert(pipelineStream.Parser)
    assert(pipelineStream.Queue)
    assert(pipelineStream.Stringify)
  })
})
