# Accessing Internals

Webamp is implemented using [Redux](https://redux.js.org/). This means that, if you need to control some aspect of Webamp that is not exposed through the public API, you can access the Redux store and dispatch actions directly.

:::danger
The Webamp Redux store is not part of the public API and **may change in future versions**. Use this feature at your own risk.
:::

To determine which actions you might want to dispatch, I recommend installing the excellent [Redux DevTools](https://chromewebstore.google.com/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en) Chrome extension. This will allow you to inspect the actions that Webamp dispatches and the state of the Redux store.

## Accessing the Redux Store

You can access the Redux store by calling the `getStore` method on the Webamp instance. This will return the Redux store, which you can then use to dispatch actions or access the current state.

```js
import Webamp from "webamp";

async function initWebamp() {
  const webamp = new Webamp({});

  // Example: Dispatch an action to change the volume before rendering
  webamp.store.dispatch({
    type: "SET_VOLUME",
    volume: 50, // Set volume to 50%
  });

  // Wait for Webamp to be ready
  await webamp.renderWhenReady(document.getElementById("winamp-container"));

  // Example: Access the current state of the Redux store
  console.log(webamp.store.getState());
}

initWebamp();
```
