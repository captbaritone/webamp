# Ussage

Here's how to use Winamp-js in your own project:

## Install

```
npm install --save winamp2-js
```

Or, you can include it via a script tag:

```html
<!-- You can use this URL, or download it and check it into your own project -->
<script src="https://unpkg.com/winamp2-js@0.0.6/built/winamp.bundle.min.js"></script>
```

## Create a container

Create a DOM element somewhere in your HTML document. This will eventually contain Winamp2-js.

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
});
// Render after the skin has loaded.
winamp.renderWhenReady(document.getElementById('winamp-container'));
```

## API

Many methods on the winamp instance deal with `track`s. Here is the shape of a `track`:

```JavaScript
const track = {
    // Either `url` or `blob` must be specified
    // Note: This URL must be served the with correct CORs headers.
    url: 'https://example.com/song.mp3',
    blob: dataBlob,

    // Optional. Name to be used until ID3 tags can be resolved.
    // If the track has a `url`, and this property is not given,
    // the filename will be used instead.
    defaultName: 'My Song',

    // Optional. Data to be used _instead_ of trying to fetch ID3 tags.
    metaData: {
        artist: 'Jordan Eldredge',
        title: "Jordan's Song"
    },

    // Optional. Duration (in seconds) to be used instead of
    // fetching enough of the file to measure its length.
    duration: 95
};
```

## Static Methods

The `Winamp` class has the following _static_ methods:

### `browserIsSupported()`

Returns a true if the current browser supports the features that Winamp2-js depends upon. It is recomended to check this before you attempt to instantiate an instance of `Winamp`.

```JavaScript
if(Winamp.browserIsSupported()) {
    new Winamp({/* ... */});
    // ...
} else {
    // Perhaps you could show some simpler player in this case.
}
```

## Construction

The `Winamp` class is constructed with an options object.

```JavaScript
const options = {
    // Required. An object representing the initial skin to use.
    // Note: This URL must be served the with correct CORs headers.
    initialSkin: {
        url: './path/to/skin.wsz'
    },

    // Optional. An array of `track`s (see above) to prepopulate the playlist with.
    initialTracks: [/* ... */],

    // Optional. An array of objects representing skins.
    // These will appear in the "Options" menu under "Skins".
    // Note: These URLs must be served the with correct CORs headers.
    avaliableSkins: [
      { url: "./green.wsz", name: "Green Dimension V2" },
      { url: "./osx.wsz", name: "Mac OSX v1.5 (Aqua)" }
    ],

    // Optional. (Default: `false`) Should global hotkeys be enabled?
    enableHotkeys: true,

    // Optional. An array of additional file pickers.
    // These will appear in the "Options" menu under "Play".
    // In the offical version. This option is used to provide a "Dropbox" file picker.
    filePickers: [{
        // The name that will appear in the context menu.
        contextMenuName: "My File Picker...",
        // A function which returns a Promise that resolves to
        // an array of `track`s (see above)
        filePicker: () => Promise.resolve([{
            url: './rick_roll.mp3'
        }]),
        // A boolean indicating if this options should be made
        // avaliable when the user is offline.
        requiresNetwork: true
    }]
};
const winamp = new Winamp(options);
```

## Instance Methods

The `Winamp` class has the following _instance_ methods:

### `appendTracks(tracks)`

Add an array of `track`s (see above) to the end of the playlist.

```JavaScript
winamp.appendTracks([
 {url: 'https://example.com/track1.mp3'},
 {url: 'https://example.com/track2.mp3'},
 {url: 'https://example.com/track3.mp3'}
]);
```

### `setTracksToPlay(tracks)`

Replace the playlist with an array of `track`s (see above) and begin playing the first track.

```JavaScript
winamp.appendTracks([
 {url: 'https://example.com/track1.mp3'},
 {url: 'https://example.com/track2.mp3'},
 {url: 'https://example.com/track3.mp3'}
]);
```

### `renderWhenReady(domNode)`

Winamp2-js will wait until it has fetch the skin and fully parsed it, and then render itself into the given container. A promise is returned which will resolve after the render is complete.

```JavaScript
const container = document.getElementById('winamp-container');
winamp.renderWhenReady(container).then(() => {
    console.log('rendered winamp!');
});
```

## Notes

* Internet Explorer is not supported.
* Winamp2-js injects CSS into the page. The CSS is namespaced under `#winamp2-js` ID, so it should not interfere with anything on the host page.
* Winamp2-js' HTML contains non-prefixed IDs and class names. If you have CSS on your page that is not namespaced, it may accidently be applied to Winamp2-js. If this happens please reach out. I may be able to resolve it.
* Skin and audio URLs are subject to [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS). Please ensure they are either served from the same domain, or that the other domain is served with the correct headers.
* Please reach out to me. I'd love to help you set it up, and understand how it's being used. I plan to expand this API as I learn how people want to use it.
