# Winamp2-js

A reimplementation of Winamp 2.9 in HTML5 and Javascript.

Works in modern versions of Firefox, Safari and Chrome. Untested in IE.

## Features

- Drag in local files or open them via the "eject" button
- Open a url using the upper left hand corner "options" icon
- Uses the acutal skin assets, so it's compatible with all skins
- "Shade" mini-mode
- Not dependent on any libraries or frameworks

## TODO

- Don't show time, stero/mono, kbps, khz or postion slider when were're not playing
- Marquee effect when the title is too long
- Handle "working" icon
- Disable previous and next
- Shade mode
    - Left and right position slider
    - Show minus sign when appropriate
- Investigate real space text
- Blog post
- Test on IE 10
- Tool for selecting a theme
    - Maybe http://gildas-lormeau.github.io/zip.js/demos/demo2.html
- Control loading state so it's not visible until it's loaded
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

## Reference

- [skinspecs.pdf](http://members.xoom.it/skinart/tutorial/skinspecs..pdf)
- [Skinner's Atlas 1.5 by Jellby](http://forums.winamp.com/showthread.php?p=951257)

## Predecessors
- After I started, I found someone else who did the same thing in 2002(!).
  Doesn't seem to work play in my modern browsers. http://forums.winamp.com/showthread.php?threadid=91850
