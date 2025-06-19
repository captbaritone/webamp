# Static Methods

The `Winamp` class has the following _static_ methods:

### `browserIsSupported()`

Returns a true if the current browser supports the features that Webamp depends upon. It is recommended to check this before you attempt to [construct](02_webamp-constructor.md) an instance of `Winamp`.

```ts
import Webamp from "webamp";

if (Winamp.browserIsSupported()) {
  new Winamp({
    /* ... */
  });
  // ...
} else {
  // Perhaps you could show some simpler player in this case.
}
```
