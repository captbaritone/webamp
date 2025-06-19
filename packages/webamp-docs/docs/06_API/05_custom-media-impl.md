# Custom Media Impl.

In order to support more advanced use cases where you want Webamp to play media using something other than the Web Audio API, you can provide your own media player implementation. This is done by defining a class which will replace the internal `Media` class.

This can be used (abused) to implement things like [Winampify](https://github.com/remigallego/winampify) which uses the Webamp UI to control playback via the Spotify Web SDK, but could also be used to implement Webamp as a client for something like [Music Player Daemon (MPD)](https://www.musicpd.org/).

:::danger
This is a bit of a hack. The API is not considered stable and may change in future versions of Webamp. You may need to suppress some TypeScript errors to get this to work.
:::

## Custom Media Implementation

```ts
import Webamp from "webamp";

class MyCustomMediaPlayer {
  // Add methods such as seeking, volume control, etc.
}

const webamp = new Webamp({
  // ... other options
  __customMediaClass: MyCustomMediaPlayer,
});

webamp.renderWhenReady(document.getElementById("winamp-container"));
```

:::tip
Check the types of the `Media` class (found via the `__customMediaClass` config property) in Webamp's TypeScript types for details of the expected methods and properties. Note that methods prefixed with `_` are not part of the public API and do not need to be implemented, despite what the types say.
:::
