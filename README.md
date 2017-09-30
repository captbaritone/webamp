 [![Travis](https://img.shields.io/travis/captbaritone/winamp2-js.svg)]() [![Codecov](https://img.shields.io/codecov/c/github/captbaritone/winamp2-js.svg)]()

# Winamp2-js

A reimplementation of Winamp 2.9 in HTML5 and JavaScript.

Works in modern versions of Edge, Firefox, Safari and Chrome. IE is [not
supported](http://caniuse.com/#feat=audio-api).

![Screenshot of Winamp2-js](./preview.png)

## Features

- Decodes the actual skin file in your browser so you can load your favorite
  Winamp 2 skins!
- Load local audio or skin files via drag-and-drop, eject button, or "options"
  button (upper left-hand corner)
- Both visualization modes: oscilloscope and spectrum
- Hotkeys
- "Shade" mini-mode
- "Doubled" mode, where the main window is twice as large: `Ctrl-D`

A more detailed list of features can be found in [features.md](./features.md).

## Development

    yarn
    # Or: npm install
    npm start

Open `http://localhost:8080/webpack-dev-server/` in your browser.

## Building

    npm install
    npm run build

Open `index.html` in your browser.

## Deploying

These commands assume you have an SSH key to my server, which you probably
don't have. Feel free to adapt them to your own server.

    npm run deploy

### Reverting

    npm run revert # Reverts quickly to the previous deploy
    HASH=<SOME_GIT_HASH> npm run deploy # Runs a new deploy at a given hashlike.

### Advanced ussage

There are some "feature flags" which you can manipulate by passing a specially crafted URL hash. Simply supply a JSON blob after the `#` of the URL to change these settings:

* `skinUrl` (string) Url of the default skin to use. Note, this file must be served with the correct Allows Origin header.
* `audioUrl` (string) Url of the default audio file to use. Note, this file must be served with the correct Allows Origin header.
* `playlistEnabled` (boolean) Should the incomplete Playlist window be made avalaible.
* `noMarquee` (boolean) Enable/disable to scrolling of the song title in the main window. It can be nice to turn this off when debugging Redux actions, since the scrolling generates a lot of noise.
* `hideAbout` (boolean) Selectively hide the byline and GitHub link at the bottom of the page. Useful for taking screenshots.
* `initialState` (object) Override the [initial Redux state](js/reducers.js). Values from this object will be recursively merged into the actual default state.

__Note:__ These are intended mostly as development tools and are subject to change at any time.


## Reference

- [skinspecs.pdf](http://members.xoom.it/skinart/tutorial/skinspecs..pdf)
- [Skinner's Atlas 1.5 by Jellby](http://forums.winamp.com/showthread.php?p=951257)
- [Winamp Skinning Tutorial](http://people.xmms2.org/~tru/promoe/Winamp_skinning_tutorial_1_5_0.pdf)

## Predecessors

- [Webamp2x](http://forums.winamp.com/showthread.php?threadid=91850) An
  impressive implementation from 2002(!).
  
- [JsAmp](http://freecog.net/2005/jsamp/demo/MainWindow.xhtml) An implementation from 2005 by @twm (via [Hacker News](https://news.ycombinator.com/item?id=15317723)).

- [LlamaCloud Comp](https://vimeo.com/20149683) From 2011 by [Lee Martin](http://www.leemartin.com/) (via [Twitter](https://twitter.com/leemartin/status/910235793737814017))

- [Winamp em HTML5 e Javascript](http://www.tidbits.com.br/winamp-em-html5-e-javascript)
  In 2010 a developer named Danilo posted one of his HTML5 experiments: "an
  audio player simulating good old Winamp". You will have to download the zip
  file.

- [JuicyDrop](http://cggaurav.github.io/juicydrop/) An HTML5 implementation with
  less empasis on being true to the skin, but fully featured visualizations.
  @cggaurav is keeping it alive on [GitHub](https://github.com/cggaurav/juicydrop)

- [Spotiamp](http://spotiamp.com/) The folks at Spotify reimplemented Winamp as
  a frontend for Spotify. Not in a browser, and only runs on Windows.

## Thanks

- Research and feature prototyping: @PAEz

Thank you to [Justin Frankel](http://www.1014.org/) and everyone at Nullsoft
for Winamp which inspired so many of us.

## License

While the Winamp name, interface, and, sample audio file are surely property of
Nullsoft, the code within this project is released under the [MIT
License](LICENSE.txt). That being said, if you do anything interesting with
this code, please let me know. I'd love to see it.
