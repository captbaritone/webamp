export default class LoadQueue {
  constructor(size) {
    this._free = size;
    this._queue = new Array();
    this.size = 0;
  }

  _remove(priority, cb) {
    const priorityQueue = this._queue[priority];
    if (priorityQueue == null) {
      return;
    }
    if (priorityQueue.has(cb)) {
      this.size--;
      priorityQueue.delete(cb);
      if (priorityQueue.size === 0) {
        // TODO: Consider splicing this out
        this._queue[priority] = undefined;
      }
    }
  }

  enqueue(cb, priority_) {
    let priority = priority_;
    if (this._queue[priority] == null) {
      this._queue[priority] = new Set();
    }
    this._queue[priority].add(cb);
    this.size++;

    this._run();

    const resp = {
      dispose: () => {
        this._remove(priority, cb);
      },
      changePriority: newPriority => {
        if (newPriority == priority) {
          return resp;
        }
        this._remove(priority, cb);
        this.enqueue(cb, newPriority);
        priority = newPriority;
      }
    };

    return resp;
  }

  _state() {
    return this._queue.map((v, i) => v && `${i} -> ${v.size}`).filter(Boolean);
  }
  _run() {
    if (this._free === 0) {
      return;
    }

    // This should skip over sparse portions of the array.
    // FALSE
    const priority = this._queue.findIndex(value => Boolean(value));
    if (priority === -1) {
      // The queue is empty
      return;
    }
    this._free--;
    const set = this._queue[priority];
    const values = set.values();
    const cb = values.next().value;

    console.log("Started priority", priority, "Queue size", this._state());
    cb().finally(() => {
      this._free++;
      console.log("Finished priority", priority, "Queue size", this._state());
      this._run();
    });

    this._remove(priority, cb);
  }
}
