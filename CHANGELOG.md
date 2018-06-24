## Next version

### Features

Users can pass an initial layout (TODO: Documentation)

### Fixes

- Fixes positioning of context menus in context menu targets when they are spawned while scrolled.

## 1.1.1

### Fixes

- Fixes the marquee text when the host page globally sets `box-sizing`.
- Fixes the initial layout when the container is not at the top of the page.
- Fixes the positioning of context menus created when scrolled down the page.

## 1.1.0

### Breaking

- Webamp will attempt to center itself within the node it is rendered into, rather than within the entire page.
- Webamp now includes the default skin directly in the JS bundle, so you don't need host it separately, or pass a URL as part of the initialztiaon.

### Features

- Equalizer sliders now "stick" slightly at zero.
- Context menus on all windows.
- Toggle window visibility via context menus.
- Users can now hard code the duration of initial tracks. This saves Webamp from having to make an HTTP request to check the duration.

### Fixed

- Marquee now displays one additional character: https://github.com/captbaritone/webamp/issues/543
- Track numbers in playlist are now padded to the length of the longest track number.
- Fix close buttons in Playlist and Equalizer in shade mode.
- Skins that omit assets will now fallback to using the default version of that asset.
- Fix seeking forward via hotkeys.

## 1.0.0

**Important:** The NPM module as **moved** from `winamp2-js` to `webamp`. You will need to update your `package.json` to point to the new module.

### Breaking

- Project renamed from "Winamp2-js" to "Webamp".
- UMD module exports as `window.Webamp` instead of `window.winamp2js`. When used via `<script>` tag.
- Deprecated: The misspelled `Webmap` construction option `avaliableSkins` has been deprecated in favor of `availableSkins`. `avaliableSkins` will continue to work, but will log a deprecation warning. [#533](https://github.com/captbaritone/webamp/pull/533) by [@remigallego](https://github.com/remigallego)

### Added

- Instance method to be notified when Webamp is closed `webamp.onClose(callback)`.
- Instance method to be notified when Webamp is minmized `webamp.onMinimize(callback)`.
- Support for skins that use `.png` sprite sheets instead of `.bmp`. This saves 15kb for the default skin on the demo page. ([b88e87](https://github.com/captbaritone/winamp2-js/commit/b88e87b6584fd9db2e2295addab7bba0c1acd226))
- We now attempt to detect mono audio files. Previously mono files would report as stereo and play only in the left channel.

### Fixed

- Shrink visualizer by one pixel to match Winamp. [#536](https://github.com/captbaritone/winamp2-js/issues/536) by [@The1Freeman](https://github.com/The1Freeman)
- Remove Google Analytics tracking module from NPM module. ([aeb9522](https://github.com/captbaritone/winamp2-js/commit/aeb9522a47ac4032f0f73fe7828c3ef01728d6aa))

## 0.0.6

- Added: `winamp.appendTracks()`.
- Added: `winamp.setTracksToPlay()`.
- Changed: We no-longer try to center on window resize.
- Meta: Added real [documentation](./docs/usage.md)!
- Meta: Remove lots of garbage from the NPM build.

## Prehistory

In all older versions, the API was not stable enough to merit a changelog.
