# Winamp.js

A reimplementation of Winamp 2.x in jQuery and css. We use the actual skin
assets so it *should* be compatible with other themes.

It comes preloaded with one track, but you can click to "eject" button to
select your own mp3 file.

Looks the most polished in Chrome but works fine in modern versions of Safari
and Firefox. Only tested on OS X.

## TODO

- Investigate real space text
- Blog post
- Test on IE 10
- Handle "working" icon
- Minimized "shade" view
- Better presentation around it
- Test other themes
- Tool for selecting a theme
    - Maybe http://gildas-lormeau.github.io/zip.js/demos/demo2.html
- Control loading state so it's not visible until it's loaded
- Marquee effect when the title is too long
- Check native app for behavior
    - When you load a track, do we auto-play? Do we update the time?
    - What does the scrubber do when we fastforward
    - Does it pause when we scrub?
    - What does the scrubber do when we get to the end of the file?
    - What does the top left button do?
    - What are the visualizer options?
        - What is the line graph version?
        - What is the bar graph version?
    - What do the clutter bar letters do?

## Someday Maybe

- Playlist window
- Visualizer? (http://w-labs.at/experiments/audioviz/)
- Actually read header info
- Actually get kbps and khz
- Actually get streo/mono
- Drag and drop file selection
- Make the window draggable
- Responsive css so it looks reasonable on my phone

## Currently Impossible

- Equalizer and balance?

## Tested in modern versions of

- Chrome (OS X, iOS, Ubuntu) - Perfect
- Firefox (OS X) - Perfect
- Safari (OS X, iOS) - Perfect

## Thanks to

- [skinspecs.pdf](http://members.xoom.it/skinart/tutorial/skinspecs..pdf)
- After I started, I found someone else who did the same thing in 2002(!).
  Doesn't seem to work play in my modern browsers. http://forums.winamp.com/showthread.php?threadid=91850
