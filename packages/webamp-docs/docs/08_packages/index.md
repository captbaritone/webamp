# Related Packages

Some aspects of Webamp's implementation are split into separate packages which may also prove useful outside of Webamp.

## Webamp Packages

- [ani-cursor](https://www.npmjs.com/package/ani-cursor) - A library for compiling Windows .ani cursors into CSS animations in the browser. [Blog post](https://jordaneldredge.com/blog/rendering-animated-ani-cursors-in-the-browser/).
- [webamp-eqf](https://www.npmjs.com/package/winamp-eqf) parse or create Winamp binary equalizer (`.eqf`) files. This is used to load and save equalizer presets in Webamp.
- [eel-wasm](https://www.npmjs.com/package/eel-wasm) - A compiler which can dynamically compiler Mikdrop visualizer preset EEL code to WebAssembly. [Blog post](https://jordaneldredge.com/blog/compiling-milkdrop-eel-code-to-webassembly/).

## Butterchurn Packages

Webamp's Milkdrop visualizer is powered by [Butterchurn](https://butterchurnviz.com/). There are a few packages related to Butterchurn which may be useful outside of Webamp:

- [butterchurn](https://www.npmjs.com/package/butterchurn) - The main Butterchurn library which can be used to render Milkdrop visualizer presets in the browser.
- [butterchurn-presets](https://www.npmjs.com/package/butterchurn-presets) - A collection of Milkdrop visualizer presets which can be used with Butterchurn.
