# timidity

[![travis][travis-image]][travis-url] [![npm][npm-image]][npm-url] [![downloads][downloads-image]][downloads-url] [![javascript style guide][standard-image]][standard-url]

[travis-image]: https://img.shields.io/travis/feross/timidity/master.svg
[travis-url]: https://travis-ci.org/feross/timidity
[npm-image]: https://img.shields.io/npm/v/timidity.svg
[npm-url]: https://npmjs.org/package/timidity
[downloads-image]: https://img.shields.io/npm/dm/timidity.svg
[downloads-url]: https://npmjs.org/package/timidity
[standard-image]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[standard-url]: https://standardjs.com

### Play MIDI files in the browser w/ Web Audio, WebAssembly, and libtimidity

Play MIDI files in a browser with a simple API.

## Demo

This package is used on [BitMidi.com](https://bitmidi.com), the wayback machine for old-school MIDI files! Check out some examples here:

- [Backstreet Boys - I Want It That Way MIDI](https://bitmidi.com/backstreet-boys-i-want-it-that-way-mid)
- [Beethoven Moonlight Sonata MIDI](https://bitmidi.com/beethoven-moonlight-sonata-mid)
- [Kingdom Hearts - Dearly Beloved MIDI](https://bitmidi.com/kingdom-hearts-dearly-beloved-mid)
- [Camptown Races MIDI](https://bitmidi.com/camptown-mid)
- [Michael Jackson - Billie Jean MIDI](https://bitmidi.com/michael-jackson-billie-jean-mid)
- [Michael Jackson - Don't Stop Till You Get Enough MIDI](https://bitmidi.com/michael-jackson-dont-stop-till-you-get-enough-mid)
- [Passenger - Let Her Go MIDI](https://bitmidi.com/passenger-let_her_go-mid)
- [Red Hot Chili Peppers - Otherside MIDI](https://bitmidi.com/red-hot-chili-peppers-otherside-mid)
- [Red Hot Chili Peppers - Californication MIDI](https://bitmidi.com/red-hot-chili-peppers-californication-mid)
- [Golden Sun - Overworld MIDI](https://bitmidi.com/golden-sun-overworld-mid)
- [Pokemon - Pokemon Center Theme MIDI](https://bitmidi.com/pokemon-pokemon-center-theme-mid)
- [Pokemon Red Blue Yellow - Opening MIDI](https://bitmidi.com/pokemon-redblueyellow-opening-yellow-mid)
- [Pokemon Red Blue Yellow - Wild Pokemon Battle MIDI](https://bitmidi.com/pokemon-redblueyellow-wild-pokemon-battle-mid)
- [Legend of Zelda - Overworld MIDI](https://bitmidi.com/legend-of-zelda-overworld-mid)

## Install

```
npm install timidity
```

## Features

- Lightweight – Just 23 KB of JavaScript and 22 KB of lazy-loaded WebAssembly
- Simple – No bells and whistles. Just what is needed to play MIDI files.
- Works with the [FreePats General MIDI soundset](https://www.npmjs.com/package/freepats).

## Usage

```js
const Timidity = require('timidity')

const player = new Timidity()
player.load('/my-file.mid')
player.play()

player.on('playing', () => {
  console.log(player.duration) // => 351.521
})
```

## Easier Usage

If you just want to play MIDI files in the browser and don't need a JavaScript
API interface, consider using the
[`bg-sound`](https://www.npmjs.com/package/bg-sound) package, which supports
this much simpler usage:

```html
<script src="bg-sound.min.js"></script>
<bg-sound src="sound.mid"></bg-sound>
```

## API

### `player = new Timidity([baseUrl])`

Create a new MIDI player.

Optionally, provide a `baseUrl` to customize where the player will look for the
lazy-loaded WebAssembly file `libtimidity.wasm` and the
[FreePats General MIDI soundset](https://www.npmjs.com/package/freepats) files.
The default `baseUrl` is `/`.

For example, here is how to mount the necessary files at `/` with the `express`
server:

```js
const timidityPath = path.dirname(require.resolve('timidity'))
app.use(express.static(timidityPath))

const freepatsPath = path.dirname(require.resolve('freepats'))
app.use(express.static(freepatsPath))
```

### `player.load(urlOrBuf)`

This function loads the specified MIDI file `urlOrBuf`, which is a `string` path
to the MIDI file or a `Uint8Array` which contains the MIDI file data.

This should be the first function called on a new `Timidity` instance.

### `player.play()`

Plays the currently loaded MIDI file.

### `player.pause()`

Pauses the currently loaded MIDI file.

### `player.seek(seconds)`

Seeks to a specified time in the MIDI file.

If the player is paused when the function is called, it will remain paused. If
the function is called from another state (playing, etc.), the player will
continue playing.

### `player.duration`

Returns the duration in seconds (`number`) of the currently playing MIDI file.
Note that `duration` will return `0` until the file is loaded, which normally
happens just before the `playing` event.

### `player.currentTime`

Returns the elapsed time in seconds since the MIDI file started playing.

### `player.destroy()`

Destroys the entire player instance, stops the current MIDI file from playing,
cleans up all resources.

Note: It's best to reuse the same player instance for as long as possible. It is
not recommended to call `player.destroy()` to stop or change MIDI files. Rather,
just call `player.pause()` to pause or `player.load()` to load a new MIDI file.

### `player.destroyed`

Returns `true` if `destroy()` has been called on the player. Returns `false`
otherwise.

### `player.on('error', (err) => {})`

This event fires if a fatal error occurs in the player, including if a MIDI file
is unable to be played.

### `player.on('timeupdate', (seconds) => {})`

This event fires when the time indicated by the `currentTime` property has been
updated.

### `player.on('unstarted', () => {})`

This event fires when a new MIDI file is being loaded.

### `player.on('ended', () => {})`

This event fires when a MIDI file has played until the end.

### `player.on('playing', () => {})`

This event fires when a MIDI file starts playing.

### `player.on('paused', () => {})`

This event fires when a MIDI file is paused.

### `player.on('buffering', () => {})`

This event fires when a MIDI file is loading.

## License

Copyright (c) [Feross Aboukhadijeh](https://feross.org).
