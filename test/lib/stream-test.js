var assert = require('assert')
var EventEmitter = require('events').EventEmitter
var Stream = require('../../lib/stream')

var metadata = {meta:'data'}

describe('stream', function() {
  it('sets defaults', function() {
    var stream = new Stream({name:'stream-test'})
    assert.equal(stream.name, 'stream-test')
    assert.equal(stream.count, 0)
    assert.equal(stream.max, 1)
    assert(!stream.debug)
    assert.equal(stream.datas, 0)
    assert.equal(stream.writes, 0)
    assert.equal(stream.nexts, 0)
    assert.equal(stream.errors, 0)
    assert.equal(stream.drains, 0)
    assert.equal(stream.noops, 0)
  })
  it('throws errors if nobody else is listening', function() {
    var stream = new Stream({name:'stream-test'})
    assert.throws(function() { stream.emit('error', new Error('not piped')) })
    assert.equal(stream.errors, 1)
  })
  describe('pipe', function() {
    var source, dest
    beforeEach(function() {
      source = new Stream({name: 'source'})
      dest = new Stream({name: 'dest'})
      dest.write = function() {}
      source.pipe(dest)
    })
    describe('data event', function() {
      it('increments the correct stats', function() {
        source.emit('data', 'test', metadata)
        assert.equal(dest.count, 1)
        assert.equal(dest.writes, 1)
        assert.equal(source.datas, 1)
      })
      it('calls write', function(done) {
        dest.write = function(data, meta) {
          assert.equal(data, 'test')
          assert.deepEqual(meta, metadata)
          done()
        }
        source.emit('data', 'test', metadata)
      })
      it('emits a debug event if set', function(done) {
        dest.debug = new EventEmitter()
        dest.debug.on('data', function(data, meta, flow) {
          assert.equal(data, 'test')
          assert.deepEqual(meta, metadata)
          assert.equal(flow,'source->dest')
          done()
        })
        source.emit('data', 'test', metadata)
      })
      it('doesnt drain if max === 1', function() {
        source.onDrain = function() {
          throw new Error('shouldnt be here')
        }
        source.emit('data', 'test', metadata)
      })
      it('drains if max > 1', function(done) {
        dest.max = 2
        source.onDrain = function() {
          done()
        }
        source.emit('data', 'test', metadata)
      })
    })
    describe('next event', function() {
      it('increments nexts', function() {
        dest.emit('next')
        assert.equal(dest.nexts, 1)
      })
      it('emits drain', function(done) {
        dest.on('drain', function() { done() })
        dest.emit('next')
      })
      it('emits data', function(done) {
        dest.on('data', function(data, meta) { 
          assert.equal(data, 'test')
          assert.deepEqual(meta, metadata)
          done()
        })
        dest.emit('next', 'test', metadata)
      })
    })
    describe('noop event', function() {
      it('increments noops', function() {
        dest.emit('noop')
        assert.equal(dest.noops, 1)
      })
      it('emits drain', function(done) {
        dest.on('drain', function() { done() })
        dest.emit('noop')
      })
      it('emits a debug event if set', function(done) {
        dest.debug = new EventEmitter()
        dest.debug.on('noop', function(meta, name) {
          assert.deepEqual(meta, metadata)
          assert.equal(name,'dest')
          done()
        })
        dest.emit('noop', metadata)
      })
    })
    describe('drain event', function() {
      it('decrements count and increments drains', function() {
        dest.emit('drain')
        assert.equal(dest.count, -1)
        assert.equal(dest.drains, 1)
      })
      it('doesnt drain if max <= count', function() {
        source.onDrain = function() {
          throw new Error('shouldnt be here')
        }
        dest.max = -1
        dest.emit('drain')
      })
      it('drains if max > count', function(done) {
        source.onDrain = function() {
          done()
        }
        dest.emit('drain')
      })
    })
    describe('error event', function() {
      it('increments errors', function() {
        dest.emit('error')
        assert.equal(dest.errors, 1)
      })
      it('emits drain', function(done) {
        dest.on('drain', function() { done() })
        dest.emit('error')
      })
      it('emits a debug event if set', function(done) {
        var err = new Error('something bad happened')
        var metadata = {meta:'data',err:err}
        dest.debug = new EventEmitter()
        dest.debug.on('error', function(meta, name) {
          assert.deepEqual(meta, metadata)
          assert.equal(name,'dest')
          done()
        })
        dest.emit('error', err, metadata)
      })
    })
  })
})
