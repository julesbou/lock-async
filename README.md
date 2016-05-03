## Lock

Locking mechanism for async functions

### Use case

In mongodb you can't execute two concurrent writes:

```js
app.put('/:id', function(req, res) {
  var coll = db.collection('mycoll')
  coll.findOne({ _id: req.params.id }, (err, doc) => {
    coll.update({ _id: req.params.id }, { count: ++doc.count })
  })
})
```

If two user call simultaneously this action with the same ID only one of both writes would be executed.

By using `lock()` it's easy to fix our problem:

```js
app.put('/:id', function(req, res) {
  lock(req.params.id, function(next) {
    var coll = db.collection('mycoll')
    coll.findOne({ _id: req.params.id }, (err, doc) => {
      coll.update({ _id: req.params.id }, { count: ++doc.count }, next)
    })
  })
})
```


### Usage

Basic example:

```js
lock(next => {
  setTimeout(() => {
    console.log(1)
    next()
  }, 1000)
})

lock(next => {
  console.log(2)
  next()
})

// 1
// 2
```

You can isolate locks, by using namespaces:

```js
lock('lock1', next => {
  setTimeout(() => {
    console.log(1)
    next()
  }, 1000)
})

lock('lock2', next => {
  console.log(2)
  next()
})

lock('lock1', next => {
  console.log(3)
  next()
})

// 2
// 1
// 3
```