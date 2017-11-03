# Audio Source Abstraction

An attempt to build a common interface for a media file source node. The goal is to have two implementations one that uses `MediaElementAudioSourceNode` and one that uses `AudioBufferSourceNode`.

See `./elementSource.js` and `./bufferSource.js`.

## Interface methods

### `constructor(audioContext, destinationNode)`

Construct a new instance:

    const source = new Source(audoContext, context.destination);

### `disconnect()`

Disconnect the source from the destination and clean up. The source cannot be reused.

### `loadFile(file)`

Load a file supplied by the user from a `<inpyt type='file'>`.

Returns a Promise so that users can play when the file is done loading.

TODO: Throw if cannot play

### `loadUrl(url: string)`

Load a url. Note that this URL is subject to CORS.

Returns a Promise so that users can play when the file is done loading.

TODO: Throw if cannot play

### `play()` 

Start playing the source.

* If already playing, start again at the begining.
* If paused, resume.
* If user has called `seekToTime()`, starts at that time.
* Has no affect if waiting.

Returns a Promise

### `pause()`

* If already puased, does nothing.
* If stopped, does nothing.
* If waiting, puts us in paused mode.
* If playing, pauses the playback at the current time.

### `stop()`

Stops playback, reverts the current time to 0.

### `seekToTime(seconds)`

Updates the current time to `seconds`.

Does not change the current status. If already playing, media will continue to play from the new time.

### `getStatus(): STATUS`

Get the current status. One of:

* "PLAYING"
* "PAUSED"
* "STOPPED"

### `getDuration(): seconds | null`

Get the duration of the current track in seconds, or `null` if no track is loaded.

### `getStalled(): boolean`

Are we buffering/loading?

### `getTimeElapsed(): seconds | null`

How many secons have elapsed?

### `getNumberOfChannels(): number | null`

### `getSampleRate(): number | null`

### `getLoop(): boolean`

### `setLoop(shouldLoop: boolean)`

### `setAutoPlay(shouldAutoPlay: boolean)`

### `on(EVENT: string, callback: () => {})`

Subscribe to events

Options:

* "statusChange": Our play status has changed.
* "positionChange": Our position changed.
* "stallChanged": We either started or stopped stalling.

## Manual test plan:

* Play a track on loop. Ensure the position indicator also loops.
* Pause a track after looping. Resume that track.
* Pause a track. Load a large file. Assert that the loading indicator shows.
* Pause a track. Resume it with play.
* Pause a track. Resume it with pause.
* Play a track. Part way through press play again. Asserrt that the track starts over.
* While a track is loading: Press play. Nothing should happen.
* Load a large file while another file is playing. Assert that the first file stops playing while we wait.