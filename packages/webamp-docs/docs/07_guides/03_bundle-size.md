# Optimizing Bundle Size

By default the Webamp import/bundle includes a few heavy dependencies. `JSZip` for extracting user defined skin files and `music-metadata-browser` for reading ID3 tags. If you are using the default skin and supply metadata and duration for all your preloaded tracks, neither of these dependencies are needed for initial load and can instead be lazily loaded only when they are needed. To do this, you can import from `webamp/lazy` instead of `webamp`.

First you'll need to install the dependencies in your project:

```bash
npm install jszip music-metadata-browser@^0.6.6
```

The "lazy" version of Webamp will require that you inject functions for lazily importing these dependencies.

```ts
import Webamp from "webamp/lazy";

const webamp = new Webamp({
  initialTracks: [
    {
      url: "https://example.com/track1.mp3",
      metaData: {
        artist: "Jordan Eldredge",
        title: "Jordan's Song",
      },
      duration: 95,
    },
  ],
  requireJSZip: () => import("jszip/dist/jszip"),
  requireMusicMetadata: () => import("music-metadata-browser/dist/index"),
});
```
