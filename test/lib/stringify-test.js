var Stringify = require('../../lib/stringify')
var assert = require('assert')

describe('stringify', function() {
  it('stringifies objects', function(done) {
    var stream = new Stringify({config: 'stringify-test'})
    stream.on('next', function(data) {
      assert.equal(data, '{"hello":"world"}')
      done()
    })
    stream.write({hello:'world'})
  })
  it('adds the delimiter', function(done) {
    var stream = new Stringify({config: 'stringify-test', delimiter: '\n'})
    stream.on('next', function(data) {
      assert.equal(data, '{"hello":"world"}\n')
      done()
    })
    stream.write({hello:'world'})
  })
  it('emits errors', function(done) {
    var stream = new Stringify({config: 'stringify-test', delimiter: '\n'})
    stream.on('error', function(err) {
      assert(err)
      done()
    })
    var obj = {hello:'world'}
    obj.circular = obj
    stream.write(obj)
  })
})
