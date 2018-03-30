## Lock [![Build Status](https://travis-ci.org/julesbou/lock-async.svg?branch=master)](https://travis-ci.org/julesbou/lock-async)

Locking mechanism for async functions

```
npm install lock-async
```

### Use case

Let's consider following API, you can call `/increment/1234` to increment a number stored in the database:

```js
express.put('/increment/:userId', function(req, res) {
  var coll = db.collection('mycoll')
  coll.findOne({ _id: req.params.id }, (err, doc) => {

    // increment `count` one time
    coll.update({ _id: req.params.id }, { count: ++doc.count })
  })
})
```

If `/increment/1234` is called two times **simultaneously**, `count` will be incremented only once (instead of twice).
This is because mongodb doesn't wait for one update to finish before starting another one.

By using `lock()` it's easy to fix our problem:

```js
var lock = require('lock-async')

express.put('/increment/:id', function(req, res) {

  // calling `lock()` will wait for `next()` callback to
  // be called before starting any consecutive call
  lock(req.params.id, function(next) {
    var coll = db.collection('mycoll')
    coll.findOne({ _id: req.params.id }, (err, doc) => {

      // increment `count` one time,
      // and call `next()` when the update is finished
      coll.update({ _id: req.params.id }, { count: ++doc.count }, next)
    })
  })
})
```

Now, if `/increment/2` is called two times again, the number will be incremented twice.

### Usage

By just using `lock(fn)`:

```js
// call `lock()` for the first time
lock(next => {
  // wait one second
  setTimeout(() => {
    console.log(1)
    next()
  }, 1000)
})

// `lock()` has already been called,
// so we wait 1sec for the first lock to finish
lock(next => {
  console.log(2)
  next()
})

// Output:
// 1
// 2
```

Or defining a namespace using `lock(namespace, fn)`:

```js
lock('lock1', next => {
  setTimeout(() => {
    console.log(2)
    next()
  }, 1000)
})

lock('lock1', next => {
  console.log(3)
  next()
})

lock('lock2', next => {
  console.log(1)
  next()
})

// Output:
// 1
// 2
// 3
```
