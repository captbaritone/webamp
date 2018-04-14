## Next version

* Marquee now displays one additional character: https://github.com/captbaritone/webamp/issues/543
* Track numbers in playlist are now padded to the length of the longest track number.

## 1.0.0

**Important:** The NPM module as **moved** from `winamp2-js` to `webamp`. You will need to update your `package.json` to point to the new module.

### Breaking

* Project renamed from "Winamp2-js" to "Webamp".
* UMD module exports as `window.Webamp` instead of `window.winamp2js`. When used via `<script>` tag.
* Deprecated: The misspelled `Webmap` construction option `avaliableSkins` has been deprecated in favor of `availableSkins`. `avaliableSkins` will continue to work, but will log a deprecation warning. [#533](https://github.com/captbaritone/webamp/pull/533) by [@remigallego](https://github.com/remigallego)

### Added

* Instance method to be notified when Webamp is closed `webamp.onClose(callback)`.
* Instance method to be notified when Webamp is minmized `webamp.onMinimize(callback)`.
* Support for skins that use `.png` sprite sheets instead of `.bmp`. This saves 15kb for the default skin on the demo page. ([b88e87](https://github.com/captbaritone/winamp2-js/commit/b88e87b6584fd9db2e2295addab7bba0c1acd226))
* We now attempt to detect mono audio files. Previously mono files would report as stereo and play only in the left channel.

### Fixed

* Shrink visualizer by one pixel to match Winamp. [#536](https://github.com/captbaritone/winamp2-js/issues/536) by [@The1Freeman](https://github.com/The1Freeman)
* Remove Google Analytics tracking module from NPM module. ([aeb9522](https://github.com/captbaritone/winamp2-js/commit/aeb9522a47ac4032f0f73fe7828c3ef01728d6aa))

## 0.0.6

* Added: `winamp.appendTracks()`.
* Added: `winamp.setTracksToPlay()`.
* Changed: We no-longer try to center on window resize.
* Meta: Added real [documentation](./docs/usage.md)!
* Meta: Remove lots of garbage from the NPM build.

## Prehistory

In all older versions, the API was not stable enough to merit a changelog.
