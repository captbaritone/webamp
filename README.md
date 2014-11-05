# Winamp.js

A reimplementation of Winamp 2.x in jQuery and css. We use the actual skin
assets so it *should* be compatible with other themes.

Works in modern versions of Firefox, Safari and Chrome. Untested in IE.

## Features

- Drag in local files or open them via the "eject" button
- Open a url using the upper left hand corner "options" icon
- Uses the acutal skin assets, so it's compatible with all skins
- "Shade" mini-mode

## TODO

- Shade mode
    - Left and right position slider
    - Show minus sign when appropriate
- Investigate real space text
- Blog post
- Test on IE 10
- Handle "working" icon
- Better presentation around it
- Test other themes
- Tool for selecting a theme
    - Maybe http://gildas-lormeau.github.io/zip.js/demos/demo2.html
- Control loading state so it's not visible until it's loaded
- Marquee effect when the title is too long
- Don't show time, stero/mono, kbps, khz or postion slider when were're not playing
- Disable previous and next
- Get version 2.91 cursors
- Check native app for behavior
    - Does it pause when we scrub? No.
    - What are the visualizer options?
        - What is the line graph version?
        - What is the bar graph version?

## Someday Maybe

- Playlist window
- Visualizer? (http://w-labs.at/experiments/audioviz/)
- Actually read header info
- Actually get kbps and khz
- Actually get streo/mono
- Make the window draggable
- Responsive css so it looks reasonable on my phone

## Currently Impossible

- Equalizer and balance?
- Get volume working on iOS devices
  (https://developer.apple.com/library/safari/documentation/audiovideo/conceptual/using_html5_audio_video/device-specificconsiderations/device-specificconsiderations.html)

## Tested in modern versions of

- Chrome (OS X, iOS, Ubuntu) - Perfect
- Firefox (OS X) - Perfect
- Safari (OS X, iOS) - Perfect

## Thanks to

- [skinspecs.pdf](http://members.xoom.it/skinart/tutorial/skinspecs..pdf)
- After I started, I found someone else who did the same thing in 2002(!).
  Doesn't seem to work play in my modern browsers. http://forums.winamp.com/showthread.php?threadid=91850
