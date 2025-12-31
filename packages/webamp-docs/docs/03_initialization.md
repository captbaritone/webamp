# Initialization

Webamp is initialized in two steps. First you create a Webamp instance, and then you render, providing a DOM element telling Webamp where you want it to appear in the document.

## Create a container

Create a DOM element somewhere in your HTML document. This will be used by Webamp to find it's initial position.

```html
<div id="winamp-container"></div>
```

:::tip
**Webamp will not actually insert itself as a child of this element.** It will will insert itself as a child of the body element, and will attempt to center itself within this element. This is needed to allow the various Webamp windows to dragged around the page unencumbered.

If you want Webamp to be a child of a specific element, use the [`renderInto(domNode)`](./06_API/03_instance-methods.md#renderintodomnode-htmlelement-promisevoid) method instead.
:::

## Initialize Webamp instance

```ts
import Webamp from "webamp";

// All configuration options are optional.
const webamp = new Webamp({
  // ... optional initialization options like initial tracks, skin, etc. can be
  // supplied here.
});

// Render after the skin has loaded.
webamp.renderWhenReady(document.getElementById("winamp-container"));
```

:::tip
See [Webamp Constructor Options](./06_API/02_webamp-constructor.md) for a list of options you can pass to the Webamp constructor.
:::

## Check compatibility

Webamp works great in all modern browser, but if you want to be sure that it will work in the current browser, you can check for compatibility before initializing Webamp.

```typescript
// Check if Winamp is supported in this browser
if (!Webamp.browserIsSupported()) {
  alert("Oh no! Webamp does not work!");
  throw new Error("What's the point of anything?");
}
```
