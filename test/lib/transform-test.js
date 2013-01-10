var Transform = require('../../lib/transform')
var assert = require('assert')

var metadata = {meta:'data'}

describe('transform', function() {
  it('picks fields from the input', function(done) {
    var stream = new Transform({name: 'tranform-test', fields: { x: true, y: true }})
    stream.on('next', function(data, meta) {
      assert.deepEqual(data, {x:1,y:2})
      assert.deepEqual(meta, metadata)
      done()
    })
    stream.write({x:1,y:2,z:3}, metadata)
  })
  it('renames fields from the input', function(done) {
    var stream = new Transform({name: 'tranform-test', fields: { x: { output: 'z' }, y: true }})
    stream.on('next', function(data, meta) {
      assert.deepEqual(data, {z:1,y:2})
      assert.deepEqual(meta, metadata)
      done()
    })
    stream.write({x:1,y:2,z:3}, metadata)
  })
  it('transforms fields from the input', function(done) {
    var stream = new Transform({name: 'tranform-test', fields: { x: { output: 'z', transform: function(x) { return x+1 } }, y: true }})
    stream.on('next', function(data, meta) {
      assert.deepEqual(data, {z:2,y:2})
      assert.deepEqual(meta, metadata)
      done()
    })
    stream.write({x:1,y:2,z:3}, metadata)
  })
  it('transforms fields from the input using the current result', function(done) {
    var stream = new Transform({
      name: 'tranform-test', 
      fields: { 
        x: { output: 'z', transform: function(x) { return x+1 } }, 
        y: { transform: function(y, current) { return y + current.z } }
      }
    })
    stream.on('next', function(data, meta) {
      assert.deepEqual(data, {z:2,y:4})
      assert.deepEqual(meta, metadata)
      done()
    })
    stream.write({x:1,y:2,z:3}, metadata)
  })
  it('doesnt add the field to the object if output is false', function(done) {
    var stream = new Transform({
      name: 'tranform-test', 
      fields: { 
        x: { output: 'z', transform: function(x) { return x+1 } }, 
        y: { 
          transform: function(y, current) { 
            current.x = y + current.z 
          },
          output: false
        }
      }
    })
    stream.on('next', function(data, meta) {
      assert.deepEqual(data, {z:2,x:4})
      assert.deepEqual(meta, metadata)
      done()
    })
    stream.write({x:1,y:2,z:3}, metadata)
  })
})
