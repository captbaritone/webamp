# Quick Start Guide

Here is the most minimal example of adding Webamp to an HTML page:

```html
<!DOCTYPE html>
<html>
  <body>
    <div id="app" style="height: 100vh">
      <!-- Webamp will attempt to center itself within this div -->
    </div>
    <script type="module">
      import Webamp from "https://unpkg.com/webamp@^2";
      const webamp = new Webamp({});

      // Returns a promise indicating when it's done loading.
      webamp.renderWhenReady(document.getElementById("app"));
    </script>
  </body>
</html>
```

:::tip
For more examples you can copy from, see [Examples](./04_examples.md).
:::

## Next Steps

1. [Installation](./02_install.md) - Learn how to install Webamp in your project, including how to use it with npm or a CDN.
2. [Initialization Options](./03_initialization.md) - Learn about the options you can pass to Webamp when initializing it. Include **tracks, skins, and more.**
3. API - Learn about the Webamp API, including how to control playback, add tracks, and more.
   - [Webamp Constructor Options](./06_API/02_webamp-constructor.md) - Learn about the options you can pass to the Webamp constructor.
   - [Webamp Instance Methods](./06_API/03_instance-methods.md) - Learn about the methods you can call on a Webamp instance.
