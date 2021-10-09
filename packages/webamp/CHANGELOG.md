## 1.5.0

### Features

- Support `.ani` cursors in skins [#1035](https://github.com/captbaritone/webamp/pull/1035), [blog post](https://jordaneldredge.com/blog/rendering-animated-ani-cursors-in-the-browser/).
- Improved support for mobile/touch screen interaction: volume, balance and position sliders, marquee, playlist and window dragging/resizing/focusing. [#1098](https://github.com/captbaritone/webamp/pull/1098)/[#1099](https://github.com/captbaritone/webamp/pull/1099)

### Bug Fixes

- Fix a number of edge cases where the close and minimize buttons in the equalizer window could render the wrong sprite [#1046](https://github.com/captbaritone/webamp/pull/1046)
- Fix a bug where unminified bundle was accidentally minified.
- Treat skin files with forward slashes in their filename as directories [#1052](https://github.com/captbaritone/webamp/pull/1052)
- Fix a bug where the Milkdrop window could not be moved in some cases [#1068](https://github.com/captbaritone/webamp/pull/1068)
- Fix a bug where the visualizer in the Playlist window was not hidden when audio was stopped. [#1072](https://github.com/captbaritone/webamp/pull/1072)
- Fix a bug where the marquee was one pixel too narrow [#1087](https://github.com/captbaritone/webamp/pull/1087)
- Fix a bug that was preventing the "Misc options" plalist submenu from opening. [c9fe24](https://github.com/captbaritone/webamp/commit/c9fe24daec32d23ac675f57e3c37854e5ecffbde)
- Rename the `.status` class to `.webamp-status` to avoid potential conflicts with host site. [#1116](https://github.com/captbaritone/webamp/pull/1116)

## 1.4.2

### Bug Fixes

- Add `webamp.close()` method to public TypeScript types.

## 1.4.1

### Features

- New Webamp instance method: `.setSkinFromUrl(url)`. See [usage.md](./docs/usage.md) for more details.
- New Webamp instance method: `.close()`. See [usage.md](./docs/usage.md) for more details.

### Bug Fixes

- Fix a bug where skins missing some images would fail to load [2e8392](https://github.com/captbaritone/webamp/commit/2e83920ca1597ad9704f01cc950d59a52c25635c)
- Clicking on the lightning icon in the main window now correctly opens our about page in a new tab [#794](https://github.com/captbaritone/webamp/pull/794)
- Skin `.ini` files can use `=` as a comment separator [577b5e3](https://github.com/captbaritone/webamp/commit/577b5e3c177f2f3ee06f9fbc6aac212adfbbc8c8)
- We nolonger cycle Milkdrop presets when media is not playing [#799](https://github.com/captbaritone/webamp/pull/799)
- Guard against some kinds of malformed `region.txt` files [0bd8b0](https://github.com/captbaritone/webamp/commit/0bd8b09ecff9f00873fc13dcd2a5662bf3efff61)

## 1.4.0

### Features

- Added optional configuration option `handleTrackDropEvent` which lets you decide how drop events get converted into tracks.
- New Webamp instance methods: `.stop()`, `.getMediaStatus()`, and `.seekToTime(seconds)`. See [usage.md](./docs/usage.md) for more details.
- Windows are now layered in the order in which they were focused ([5ee1a4](https://github.com/captbaritone/webamp/commit/5ee1a4f7b024d9e667c41d24c961404e463009c4))
- When focusing something other than Webamp, it's now possible for no windows to be selected ([6132ac](https://github.com/captbaritone/webamp/commit/6132acdf2cd42b56bf757fa101fc08203e84fd67))

### Bug Fixes:

- Fix a bug where context menus could appear in the wrong location ([95db2d](https://github.com/captbaritone/webamp/commit/95db2d08b6b189f5b9da577d23aca44b04c462a8))
- Fix a bug where pressing next/previous when stopped would play the track ([#740](https://github.com/captbaritone/webamp/issues/730))
- Fix a bug where `webamp.dispose` would error if the `#webamp` node had been reparented to anything other than `document.body`.
- Fix a bug where tracks dropped in the main window were not autoplayed ([f8167d](https://github.com/captbaritone/webamp/commit/f8167dd32209e1a71958190abc037df79642a2cb))

### Internal Improvements:

- Upgraded [React Redux](https://github.com/reduxjs/react-redux) ([c3c3ad](https://github.com/captbaritone/webamp/commit/c3c3ad69abacdc34b58f3385b39b2634e9271590))
- Several improvements to the performance of rendering Redux updates ([c75214](https://github.com/captbaritone/webamp/commit/c75214dcd7475b27f24c159cda26117a143ff740), [73f87b](https://github.com/captbaritone/webamp/commit/73f87be7c34acf5d0d5227a2a1b0e9718da11875), [4322aa](https://github.com/captbaritone/webamp/commit/4322aade4b5a60926c280e1807c4592cf915b497), [e89aa2](https://github.com/captbaritone/webamp/commit/e89aa266121ba7f890b96351d2da46314b7589e7),)

## 1.3.1 [CURRENT]

### Bug Fixes:

- Fix issue where `music-metadata-browser` was not imported correctly, and id3 tags could not be read. ([324fc2](https://github.com/captbaritone/webamp/commit/324fc29ca6c94fa54091608323842ba0604e0b4c))

## 1.3.0

This release is far overdue. In the last six months we've made a huge number of improvements to Webamp.

We've fixed multiple longstanding bugs and continued to inch closer to pixel-perfect parity with Winamp. We've added several methods which make it easier to use Webamp in your project. In addition, we've continued to invest in the code by refactoring code to make it more maintainable, and converting the entire project from vanilla JavaScript to TypeScript which should help reduce the number of "dumb" bugs.

See a full list below:

### Features:

- Added methods to the webamp instance to control playback. See the [Usage Docs](./docs/usage.md) for more information:
  - `webamp.play()`
  - `webamp.pause()`
  - `webamp.previousTrack()`
  - `webamp.nextTrack()`
  - `webamp.seekForward(seconds)`
  - `webamp.seekBackward(seconds)`
- Our ID3 parsing library [jsmediatags](https://github.com/aadsm/jsmediatags) has been replaced by [music-metadata-browser](https://www.npmjs.com/package/music-metadata-browser). This means we now support a broader range of media types, and also that the bitrate and sample rate displayed are now functional
- The default skin is now included in the Skins section of the options menu by default
- Implemented the "Options" sub context menu. Click the "O" in the "clutter bar" or select "Options" from the main context menu to see it
- The equlizer graph is nolonger antialiased. It is now pixelated like real Winamp
- Added a `.reopen()` method to reopen Webamp after you've closed it ([47ba520](https://github.com/captbaritone/webamp/commit/47ba520c2422d8e4842468a32ca13492845183cd))
- Stip diacritic marks from song description so it displays better in the marquee ([2b2598](https://github.com/captbaritone/webamp/commit/2b2598329d3891ee8a976b8169066586110a767a))

### Bug Fixes:

- Fixed a longstanding bug where mono audio files would only play in the right channel ([4fd802](https://github.com/captbaritone/webamp/commit/4fd802f96efabb98c3c1573819eed37fec630f90))
- Fixed a bug ([#687](https://github.com/captbaritone/webamp/issues/687)) where `webamp.appendTracks()` would cause currently playing media to pause.
- Avoid sticking a file `<input>` into the global DOM ([343686](https://github.com/captbaritone/webamp/commit/343686f7454c4ece95b520fa3ddbf3ecc0198100))
- Fix a bug where tracks dragged into the playlist were added at the wrong location ([b074e0](https://github.com/captbaritone/webamp/commit/b074e0eff35ac8b1b34efa902681aa19ba2b8629))
- Fix a bug where skin cursors were not being shown for the equalizer sliders ([65bb59d](https://github.com/captbaritone/webamp/commit/65bb59353dc2da858440a3d753aec02fb771f0cc))
- The Marquee text is nolonger blury when in "Double Size" mode ([4b5320](https://github.com/captbaritone/webamp/commit/4b53209e0cc0a9e0cd84821d012c1770a940063c))
- Scrolling in the Equalizer window nolonger changes the volume ([48a937](https://github.com/captbaritone/webamp/commit/48a937da8722ccfd3c2e9df378a847c453c36864))
- Clicking anywhere in a equalizer slider now makes the button depress ([20e681](20e6811e6f59e82a5765c38b0b33fbed2eb575ee)
- Parsing of the `viscolor.txt` file in skins is now more permissive, allowing us to support more skins ([0d29ff](0d29ffe3f4b20505005346cbc97d0cdf85664619))
- The hotkeys to seek forward/backwards 10 tracks now works propery ([7d9ef4](https://github.com/captbaritone/webamp/commit/7d9ef4287f7294f6bdc1db89b717592cf4e48f17))
- Fix a bug where the preamp level was not applied until you changed it ([f03c88](https://github.com/captbaritone/webamp/commit/f03c88c6d89fd51cbc0538841bb3227accfa0431))
- Fix a bug where `.eqf` values were encoded incorrectly ([c634cd](https://github.com/captbaritone/webamp/commit/c634cd8b947e5d2d8b94b38023bc20097737a995))
- Preamp and EQ now boost/attenuate the same way original winamp 2 did ([#748](https://github.com/captbaritone/webamp/pull/748))

### Internal Improvements:

- Webamp is now written in [TypeScript](https://www.typescriptlang.org/).
- Upraded to React and began using a few [hooks](https://reactjs.org/docs/hooks-overview.html).
- We nolonger depend upon [cardinal-spline-js](https://www.npmjs.com/package/cardinal-spline-js), we use our own implementation.

## 1.2.0

### Features

- Users can register an `onWillClose` callback, which is passed a `cancel` function. The `cancel` function can be called to prevent Webamp from closing. [#655](https://github.com/captbaritone/webamp/pull/655)

### Internal changes

- Webamp is now mostly built with [TypeScript](https://www.typescriptlang.org/).

## 1.1.2

### Changes

Webamp is no-longer rendered into the DOM node you pass into `webamp.renderWhenReady()`. Instead, Webamp is rendred as a direct child of the `<body>` tag. The passed DOM node is still used for positioning. Webamp will attempt to center itself within that DOM node when it renders.

### Features

- Allow consumers to specify a z-index when constructing Webamp.

### Fixes

- Fixes positioning of context menus in context menu targets when they are spawned while scrolled.
- Improve performance of CharacterString, which gets rendered on every marquee step.

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
