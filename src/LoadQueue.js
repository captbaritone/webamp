export default class LoadQueue {
  constructor(size) {
    this._free = size;
    this._queue = new Array();
  }

  _remove(priority, cb) {
    const priorityQueue = this._queue[priority];
    if (priorityQueue == null) {
      return;
    }
    priorityQueue.delete(cb);
    if (priorityQueue.size === 0) {
      this._queue[priority] = undefined;
    }
  }

  enqueue(cb, priority) {
    if (this._queue[priority] == null) {
      this._queue[priority] = new Set();
    }
    this._queue[priority].add(cb);

    this._run();

    return () => {
      this._remove(priority, cb);
    };
  }
  _run() {
    if (this._free === 0) {
      return;
    }
    const priority = this._queue.findIndex(value => Boolean(value));
    if (priority === -1) {
      // The queue is empty
      return;
    }
    this._free--;
    const set = this._queue[priority];
    const values = set.values();
    const cb = values.next().value;

    cb().finally(() => {
      this._free++;
      this._run();
    });

    this._remove(priority, cb);
  }
}
