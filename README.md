 [![Travis](https://img.shields.io/travis/captbaritone/winamp2-js.svg)]() [![Codecov](https://img.shields.io/codecov/c/github/captbaritone/winamp2-js.svg)]()

# Winamp2-js

A reimplementation of Winamp 2.9 in HTML5 and Javascript.

Works in modern versions of Firefox, Safari and Chrome. IE is [not
supported](http://caniuse.com/#feat=audio-api).

## Features

- Decodes the actual skin file in your browser so you can load your favorite
  Winamp 2 skins!
- Load local audio or skin files via drag-and-drop, eject button, or "options"
  button (upper left-hand corner)
- Both visualization modes: oscilloscope and spectrum
- Hotkeys
- "Shade" mini-mode
- "Doubled" mode, where the main window is twice as large: `Ctrl-D`

## Building

    npm install
    npm run build

Open `index.html` in your browser.

## Development

    npm start

Open `http://localhost:8080/webpack-dev-server/` in your browser.

## Reference

- [skinspecs.pdf](http://members.xoom.it/skinart/tutorial/skinspecs..pdf)
- [Skinner's Atlas 1.5 by Jellby](http://forums.winamp.com/showthread.php?p=951257)
- [Winamp Skinning Tutorial](http://people.xmms2.org/~tru/promoe/Winamp_skinning_tutorial_1_5_0.pdf)

## Predecessors

- [Webamp2x](http://forums.winamp.com/showthread.php?threadid=91850) An
  impressive implementation from 2002(!). Doesn't seem to work/play in my
  modern browsers.

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
