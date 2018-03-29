# Use Winamp2-js in your project

**PRE ALPHA**

There are many websites that could potentially benefit from having Winamp embeded in them. That said, nobody that I know of is really doing this in production. In an attempt to try this out, I have published Winamp2-js as an NPM package. The API is far from stable as I don't actually know all the various use-cases it should support. Some potential ones are:

* A player that comes preloaded with a SoundCloud playlist.
* A player that's compatible with [https://github.com/justinfrankel/WHUMP] database files.
* A player that can be used to demonstrate skins on a skins website.
* A generic podcast widget.
* Something else?

You can attempt to use it in your JS project like so:

## Install

```
npm install --save winamp2-js
```

Or, you can include it via a script tag:

```html
<!-- You can use this URL, or download it and check it into your own project -->
<script src="https://unpkg.com/winamp2-js@0.0.5/built/winamp.bundle.min.js"></script>
```

## Create a container

Create a DOM element somewhere in your HTML document:

```html
<div id='winamp-container'></div>
```

## Initialize the JavaScript

```JavaScript
import Winamp from 'winamp2-js';

// Or, if you installed via a script tag:
// const Winamp = window.winamp2-js;

// Check if Winamp is supported in this browser
if(!Winamp.browserIsSupported()) {
    alert("Oh no! Winamp does not work!")
    throw new Error("What's the point of anything?")
}

const winamp = new Winamp({
  initialTracks: [{
    metaData: {
      artist: "DJ Mike Llama",
      title: "Llama Whippin' Intro",
    },
    // Can be downloaded from: https://github.com/captbaritone/winamp2-js/raw/master/mp3/llama-2.91.mp3
    url: "path/to/mp3/llama-2.91.mp3"
  }],
  initialSkin: {
    // Can be downloaded from https://github.com/captbaritone/winamp2-js/raw/master/skins/base-2.91.wsz
    url: "path/to/skins/base-2.91.wsz"
  },
  enableHotkeys: true // Enable hotkeys
});
// Render after the skin has loaded.
winamp.renderWhenReady(document.getElementById('winamp-container'));
```

## Notes:

* This should not be considered "production" code.
  * Winamp2-js does not support Internet Explorer.
  * Winamp2-js was built to run on its own page, it may not play well with surrounding CSS.
* Skin and audio URLs are subject to [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS). Please ensure they are either served from the same domain, or that the other domain is served with the correct headers.
* This API is subject to change at any time.
* Please reach out to me. I'd love to help you set it up, and understand how it's being used. I plan to expand this API as I learn how people want to use it.
