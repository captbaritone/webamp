import invariant from "invariant";
import TinyQueue from "tinyqueue";

// Push promises onto a queue with a priority.
// Run a given number of jobs in parallel
// Useful for prioritizing network requests
export default class LoadQueue {
  constructor({ threads }) {
    // TODO: Consider not running items with zero priority
    // Priority is a function so that items can change their priority between
    // when their priority is evaluated.
    // For example, we might add a track to the playlist and then scroll to/away
    // from it before it gets processed.
    this._queue = new TinyQueue([], (a, b) => a.priority() - b.priority());
    this._availableThreads = threads;
  }

  push(task, priority) {
    const t = { task, priority };
    this._queue.push(t);
    // Wait until the next event loop to pick a task to run. This way, we can
    // enqueue multiple items in an event loop, and be sure they will be run in
    // priority order.
    setTimeout(() => {
      this._run();
    }, 0);
    return () => {
      // TODO: Could return a boolean representing if the task has already been
      // kicked off.
      this._queue = this._queue.filter((t1) => t1 !== t);
    };
  }

  _run() {
    while (this._availableThreads > 0) {
      if (this._queue.length === 0) {
        return;
      }
      this._availableThreads--;
      const t = this._queue.pop();
      const promise = t.task();
      invariant(
        typeof promise.then === "function",
        `LoadQueue only supports loading Promises. Got ${promise}`
      );
      promise.then(() => {
        this._availableThreads++;
        this._run();
      });
    }
  }
}
