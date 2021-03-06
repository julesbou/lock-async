"use strict"

const assert = require('chai').assert
const async = require('async')
const lock = require('./lock.js')

describe('lock', function() {

  function asyncPush(val, timeout) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        map.push(val)
        resolve()
      }, timeout)
    })
  }

  let map

  beforeEach(function() {
    map = []
  })

  it('sync', function() {
    lock(next => map.push(1) && next())
    lock(next => map.push(2) && next())
    lock(next => map.push(3) && next())
    lock(next => map.push(4) && next())

    assert.deepEqual(map, [1, 2, 3, 4])
  })

  it('async', function(done) {
    lock(next => asyncPush(1, 10).then(next))
    lock(next => asyncPush(2, 5).then(next))
    lock(next => asyncPush(3, 20).then(next))
    lock(next => asyncPush(4, 15).then(next))

    setTimeout(() => {
      assert.deepEqual(map, [1, 2, 3, 4])
      done()
    }, 100)
  })

  it('parallel', function(done) {
    async.parallel([
      () => lock(next => asyncPush(1, 10).then(next)),
      () => lock(next => asyncPush(2, 5).then(next)),
      () => lock(next => asyncPush(3, 20).then(next)),
      () => lock(next => asyncPush(4, 15).then(next)),
    ])

    setTimeout(() => {
      assert.deepEqual(map, [1, 2, 3, 4])
      done()
    }, 100)
  })

  it('namespace', function(done) {
    lock('ns1', next => asyncPush(1, 10).then(next))
    lock('ns2', next => asyncPush(2, 5).then(next))
    lock('ns2', next => asyncPush(3, 20).then(next))
    lock('ns2', next => asyncPush(4, 15).then(next))

    setTimeout(() => {
      assert.deepEqual(map, [2, 1, 3, 4])
      done()
    }, 100)
  })
})
