# Optimizing Bundle Size

By default the Webamp import/bundle includes a few heavy dependencies. [`JSZip`](https://www.npmjs.com/package/jszip) for extracting user defined skin files and [`music-metadata`](https://www.npmjs.com/package/music-metadata) for reading ID3 tags. If you are using the default skin and supply metadata and duration for all your preloaded tracks, neither of these dependencies are needed for initial load and can instead be lazily loaded only when they are needed. To do this, you can import from `webamp/lazy` instead of `webamp`.

First you'll need to install the dependencies in your project:

```bash
npm install jszip music-metadata
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
  requireMusicMetadata: () => import("music-metadata"),
});
```

## Milkdrop

Webamp's Milkdrop window is powered by the third party library [Butterchurn](https://butterchurnviz.com/). In `webamp/lazy` neither Butterchurn nor any visualizer presets are included. Getting Butterchurn to work with Webamp requires some additional configuration which is still a bit fiddly, but is possible. This is achieved by passing an `__butterchurnOptions` object to the Webamp constructor.

### `__butterchurnOptions`

#### Butterchurn

Butterchurn is not being actively maintained, but it is still works
great. Before it went into maintenance mode Jordan Berg (different
Jordan) cut a beta release of a version with the faster/more secure
[eel->Wasm compiler](https://jordaneldredge.com/blog/speeding-up-winamps-music-visualizer-with-webassembly/) that I wrote, so we use `butterchurn@3.0.0-beta.3`.

This version is still using AMD modules, so it will write the export to
`window.butterchurn`. This is a pretty chunky files, so you way want to
find a way to lazy load it inside `importButterchurn` below.
Unfortunately, it's not an ES module, so I wasn't able to call
`import()` on it without some kind of bundler.

#### Presets

The module, `butterchurn-presets@3.0.0-beta.4` contains a curated set
of awesome Butterchurn presets that have been packaged up to work with
the new compiler. This module is also packaged as an AMD module, so
when imported without a bundler it will write the export to `window`. I
think the package was never that thoughtfully built, so the export name
is, confusingly `window.base`. If that's a problem, using a bundler
might help.

As audio plays, Webamp will randomly cycle through these presets with a
cool transition effect. You can also press "l" while the Milkdrop
window is open to open Milkdrop's preset selection menu.

#### Example

```ts
const webamp = new Webamp({
  __butterchurnOptions: {
    importButterchurn: () => import("butterchurn"),
    getPresets: async () => {
      const butterchurnPresets = await import(
        "butterchurn-presets/dist/base.js"
      );
      return Object.entries(butterchurnPresets).map(([name, preset]) => {
        return { name, butterchurnPresetObject: preset };
      });
    },
  },
  requireJSZip: () => import("jszip/dist/jszip"),
  requireMusicMetadata: () => import("music-metadata"),
});
```
