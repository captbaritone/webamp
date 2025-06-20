// A Fork of the NPM module `setimmediate`
// I've adapted this to only include the browser implementation and to not
// mutate the global object and instead export the `setImmediate` function.

type Handle = { callback: Function; args: any[] };
type TaskByHandle = { [handle: number]: Handle };

let nextHandle = 1; // Spec says greater than zero
const tasksByHandle: TaskByHandle = {};
let currentlyRunningATask = false;
let registerImmediate: (arg0: number) => void;

export function setImmediate(callback: Function) {
  // Copy function arguments
  const args = new Array(arguments.length - 1);
  for (let i = 0; i < args.length; i++) {
    args[i] = arguments[i + 1];
  }
  // Store and register the task
  const task = { callback: callback, args: args };
  tasksByHandle[nextHandle] = task;
  registerImmediate(nextHandle);
  return nextHandle++;
}

function clearImmediate(handle: number) {
  delete tasksByHandle[handle];
}

function run(task: Handle) {
  const callback = task.callback;
  const args = task.args;
  switch (args.length) {
    case 0:
      callback();
      break;
    case 1:
      callback(args[0]);
      break;
    case 2:
      callback(args[0], args[1]);
      break;
    case 3:
      callback(args[0], args[1], args[2]);
      break;
    default:
      // eslint-disable-next-line prefer-spread
      callback.apply(undefined, args);
      break;
  }
}

function runIfPresent(handle: number) {
  // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
  // So if we're currently running a task, we'll need to delay this invocation.
  if (currentlyRunningATask) {
    // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
    // "too much recursion" error.
    setTimeout(runIfPresent, 0, handle);
  } else {
    const task = tasksByHandle[handle];
    if (task) {
      currentlyRunningATask = true;
      try {
        run(task);
      } finally {
        clearImmediate(handle);
        currentlyRunningATask = false;
      }
    }
  }
}

function canUsePostMessage() {
  // The test against `importScripts` prevents this implementation from being installed inside a web worker,
  // where `global.postMessage` means something completely different and can't be used for this purpose.
  if (!window.importScripts) {
    let postMessageIsAsynchronous = true;
    const oldOnMessage = window.onmessage;
    window.onmessage = function () {
      postMessageIsAsynchronous = false;
    };
    window.postMessage("", "*");
    window.onmessage = oldOnMessage;
    return postMessageIsAsynchronous;
  }
}

function installPostMessageImplementation() {
  // Installs an event handler on `global` for the `message` event: see
  // * https://developer.mozilla.org/en/DOM/window.postMessage
  // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

  const messagePrefix = `setImmediate$${Math.random()}$`;

  window.addEventListener(
    "message",
    (event) => {
      if (
        event.source === window &&
        typeof event.data === "string" &&
        event.data.indexOf(messagePrefix) === 0
      ) {
        runIfPresent(+event.data.slice(messagePrefix.length));
      }
    },
    false
  );

  registerImmediate = function (handle) {
    window.postMessage(messagePrefix + handle, "*");
  };
}

function installSetTimeoutImplementation() {
  registerImmediate = function (handle) {
    setTimeout(runIfPresent, 0, handle);
  };
}

if (canUsePostMessage()) {
  // For non-IE10 modern browsers
  installPostMessageImplementation();
} else {
  // For older browsers
  installSetTimeoutImplementation();
}
