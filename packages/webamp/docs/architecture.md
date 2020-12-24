# Architecture

## Library/Application

This repository contains both an NPM module, and a demo page, found at <https://webamp.org>. The NPM module's goal is to provide a widget which can be embedded in any website, where as the demo page depends upon the library, and provides the canonical usage. You can find more information about the library's API in the [usage](./usage.md) document.

- The entry point for the demo page is [demo/js/index.js](../demo/js/index.js)
- The entry point for the NPM modules is [webamp.js](../js/webamp.js)

## Redux

Within the core library, state is managed by [Redux]. In fact, Redux's own docs mention Webamp in the [Apps and Examples](https://redux.js.org/introduction/learning-resources#apps-and-examples) section of their docs!

Our reducers, and the states they control, can be found in the [reducers](../js/reducers/) directory.

Async actions are handled using the [redux-thunk]. You can find all of the actionCreators in the [actionCreators](../js/actionCreators/index.ts) file. This is the most complex portion of the app, as it contains all the coordination of our many async actions.

Any non-trivial value derived from state is computed inside a [selector](../js/selectors.ts). Care has been taken to ensure that the structure of the state allows for most common selectors to be a constant time operation. For selectors that are `O(n)`, we use [reselect] to ensure the calculation is only done when dependent values change.

Coordination between the playing media (which is inherently stateful, and changes over time) and Redux is handed in the [mediaMiddleware](../js/mediaMiddleware.ts). This basically listens for events, and triggers the correct methods on our `Media` instance. It also listens events emitted by the media instance, and dispatches the corresponding actions.

## React

We use [react-redux] to bind Redux state into our [React components](../js/components/). Any component which is not reusable, and even some that are, are connected using [connect]. This works well for us, since most components are "one off", and connecting most components allows for state changes to result in a mininmal set of react components needing to re-render. This does, however, require that our selectors be performant.

## Media

Media (audio files) is managed by our [Media](../js/media/index.ts) class. It encapsulates the Web Audio API complexity. Audio manipulation (volume, balance, EQ) is handled in the main `Media` class, but the audio source is managed in [elementSource.ts](../js/media/elementSource.ts). This class tries to encapsulate some of the complexity required to get the playing of audio files working across all browsers seamlessly. We handle playing audio from a URL source (subject to CORs) and from a local file. Both of these are normalized to a URL before they are passed into our audio aparatus. For local files, we convert the `ArrayBuffer` we get, into a Blob url using `URL.createObjectURL()`. This transformation is handlded inside our Action Creators (see the Redux section above).

The `Winamp` class instantiates a single `Media` instance and passes it's [AnalyserNode](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode) down through the tree of React components to the visualizer.

## Skins

Winamp skins (`.wsz`) are, under the hood, just `.zip` files which contain `.bmp` sprite sheets, and some config files. We use [JSZip] to unpack the zip archive, and then some clever canvas slicing to extract the individual sprites out of each `.bmp`. We get these sprite images as [data URIs] which are dispatched to Redux. We then have a [Skin](../js/components/Skin.tsx) component which renders a `<style>` tag into the `<head>` using [React Portals](https://reactjs.org/docs/portals.html). You can read more about this in a [blog post](https://jordaneldredge.com/blog/how-winamp2-js-loads-native-skins-in-your-browser/) I wrote.

In addition to the sprite sheets there are some config files in various formats, mostly `.ini` (although with different names). We have a very simple `.ini` parser, for these files. Finally, there is a `region.txt` which defines some vectors which define the transparent areas of a skin. We have a custom parser for this file format, and then dispatch the data to Redux.

From there, our `Skin` component has a `ClipPaths` sub component which ouputs a series of `<svg>`s representing the clip path for each window into the DOM. Finally, CSS `clip-path` rules representing each window are dynamically generated and added to the injected style sheet.

The parsing of skin files is handed in [skinParser.js](../js/skinParser.js). Rendering the `<svg>` and `<style>` tags is done in [Skin.js](../js/components/Skin.tsx). The definitions for all the individual sprites live in [skinSpirtes.js](../js/skinSprites.ts), and the mapping of skin spirtes to CSS rules lives in [skinSelectors.js](../js/skinSelectors.ts).

## CSS

CSS style sheets are imported by the components which use them. Each rule is individually prefixed with the id `#webamp` to prevent our style rules from "leaking" out onto other potential elements. For example, [98.js.org], includes Webamp on a page along with many other elements, and we want to be sure our rules for `.selected` elements do not apply to any elements outside of `#webamp`.

The nature of Winamp skins is such that most elements are absolutely positioned, and have an explicit size. There are a few down sides to our current approach:

1. Much of the size data for the individual sprites is duplicated in the items CSS rules and in [skinSprites.js](../js/skinSprites.ts).
2. Style data is lives far away from the individual component, and it can be hard to know where to look for the CSS that corresponds to an individual component.

All windows are rendred with `image-rendering: pixelated;` (or equivilant) so that high density displays don't blur the pixel art UI. This is especially important for "Double" mode, where the main and equalizer windows are twice as large. This doubleing is achived with the CSS: `transform: scale(2)`.

## Visualizer

The visualizer in the main window is a React component [Visualizer.tsx](../js/components/Visualizer.tsx) that gets passed skin data from the Redux store, an [analyser node](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode) and some various user settings (which visualizer should be shown? are we playing?). All computation is done such that it works both in the "regular" mode, but also in shade mode. In shade mode the dimension values are just different.

To improve performance, two off-screen canvases are pre-rendered whenever the skin changes. These are then used as components of the per-frame rendering:

- The textured background.
- A single vertical bar for the bar graph analyser.

The actual canvas is rendered at twice the visible size so that "high density" or "retina" displays will not look blury.

## Equalizer

The audio portion of the equalizer is handed in the Media class (see above) but the visual representation of the current equalizer settings is created using [spline.js] which calculates the curved line for us.

The coloring of the curved line is achived by extracting the single-pixel-wide, many-pixel-tall sprite from the skin file, passing it through the Redux state to the graph component, and then drawing the splined line with [CanvasRenderingContext2D.createPattern()
](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createPattern).

You can see the implementation of the equalizer graph in [EqGraph.tsx](../js/components/EqualizerWindow/EqGraph.tsx).

The equalizer window can also load/geneate `.eqf` files. The loading and parsing of these has been extracted into its own NPM module: [winamp-eqf](https://www.npmjs.com/package/winamp-eqf).

## Playlist

**TODO**

- Windowing
- Resizing
- Menus

## Window management

Window position is managed in the [WindowManager.tsx](../js/components/WindowManager.tsx) React component. It handles:

- Dragging windows around (windows can add a `.draggable` class to any node to make it a drag handle)
- Snapping windows to eachother
- Snapping windows to the browser edges
- Creating the initial layout of the windows

Moving windows when their neighbors are resized via "double" or "shade" mode toggles is handled by the `withWindowGraphIntegrity()` higher order action creator in [actionCreators](../js/actionCreators/index.ts). It works by:

1. Computing a graph where each window is a node, and the edges are where those windows are "touching".
2. Dispatching the passed in action.
3. Looking at the new sizes, and dispatching another event to move the windows to new locations where the original edeges are all still touching.

## Dropping files

Webamp allows you to drag files (media files, skins and `.eqf` equalizer presets) onto various windows to load them. This behavior is manged by the [`<DropTarget>`](../js/components/DropTarget.tsx) component. The component expects to be passed a `handleDrop` handler which will be called with the drop event, and also the `{x, y}` coordinates of the drop within the component. This is needed to allow us to insert dropped tracks at the correct place in the playlist.

[redux]: https://redux.js.org/
[redux-thunk]: https://github.com/gaearon/redux-thunk
[reselect]: https://github.com/reactjs/reselect
[connect]: https://react-redux.js.org/api/connect
[jszip]: https://stuk.github.io/jszip/
[data uris]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
[98.js.org]: https://98.js.org
[spline.js]: ../js/components/EqualizerWindow/spline.js
