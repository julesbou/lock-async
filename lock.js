"use strict"

const queue = new Map()
const pending = new Map()

module.exports = function lock(namespace, callback) {
  if (!callback) {
    callback = namespace
    namespace = '__global_namespace__'
  }

  const next = () => {
    // dequeue
    if (queue.has(namespace) && queue.get(namespace).length) {
      queue.get(namespace)[0](next)
      queue.set(namespace, queue.get(namespace).slice(1))
    }
    // end of queue
    else {
      queue.delete(namespace)
      pending.delete(namespace)
    }
  }

  // queue
  if (pending.get(namespace)) {
    queue.has(namespace) || queue.set(namespace, [])
    queue.get(namespace).push(callback)
  }

  // call immediately
  else {
    pending.set(namespace, true)
    callback(next)
  }
}
