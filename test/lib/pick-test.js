var Pick = require('../../lib/pick')
var assert = require('assert')

var metadata = {meta:'data'}

describe('pick', function() {
  it('picks a fields from the input', function(done) {
    var stream = new Pick({name: 'pick-test', field: 'x'})
    stream.on('next', function(data, meta) {
      assert.deepEqual(data, 1)
      assert.deepEqual(meta, metadata)
      done()
    })
    stream.write({x:1,y:2,z:3}, metadata)
  })
})
