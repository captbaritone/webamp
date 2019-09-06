const Debug = require('debug')
const EventEmitter = require('events').EventEmitter
const fs = require('fs')
const LibTimidity = require('./libtimidity')

const debug = Debug('timidity')
const debugVerbose = Debug('timidity:verbose')

// Inlined at build time by 'brfs' browserify transform
const TIMIDITY_CFG = fs.readFileSync(
  __dirname + '/freepats.cfg', // eslint-disable-line no-path-concat
  'utf8'
)

const SAMPLE_RATE = 44100
const AUDIO_FORMAT = 0x8010 // format of the rendered audio 's16'
const NUM_CHANNELS = 2 // stereo (2 channels)
const BYTES_PER_SAMPLE = 2 * NUM_CHANNELS
const BUFFER_SIZE = 16384 // buffer size for each render() call

const AudioContext = typeof window !== 'undefined' &&
  (window.AudioContext || window.webkitAudioContext)

class Timidity extends EventEmitter {
  constructor (baseUrl = '/') {
    super()

    this.destroyed = false

    if (!baseUrl.endsWith('/')) baseUrl += '/'
    this._baseUrl = new URL(baseUrl, window.location.origin).href

    this._ready = false
    this._playing = false
    this._pendingFetches = {} // instrument -> fetch
    this._songPtr = 0
    this._bufferPtr = 0
    this._array = new Int16Array(BUFFER_SIZE * 2)
    this._currentUrlOrBuf = null // currently loading url or buf
    this._interval = null

    this._startInterval = this._startInterval.bind(this)
    this._stopInterval = this._stopInterval.bind(this)

    // If the Timidity constructor was not invoked inside a user-initiated event
    // handler, then the AudioContext will be suspended. See:
    // https://developers.google.com/web/updates/2017/09/autoplay-policy-changes
    this._audioContext = new AudioContext()

    // Start the 'onaudioprocess' events flowing
    this._node = this._audioContext.createScriptProcessor(
      BUFFER_SIZE,
      0,
      NUM_CHANNELS
    )
    this._onAudioProcess = this._onAudioProcess.bind(this)
    this._node.addEventListener('audioprocess', this._onAudioProcess)
    this._node.connect(this._audioContext.destination)

    this._lib = LibTimidity({
      locateFile: file => new URL(file, this._baseUrl).href,
      onRuntimeInitialized: () => this._onLibReady()
    })
  }

  _onLibReady () {
    this._lib.FS.writeFile('/timidity.cfg', TIMIDITY_CFG)

    const result = this._lib._mid_init('/timidity.cfg')
    if (result !== 0) {
      return this._destroy(new Error('Failed to initialize libtimidity'))
    }

    this._bufferPtr = this._lib._malloc(BUFFER_SIZE * BYTES_PER_SAMPLE)

    debugVerbose('Initialized libtimidity')
    this._ready = true
    this.emit('_ready')
  }

  async load (urlOrBuf) {
    debug('load %o', urlOrBuf)
    if (this.destroyed) throw new Error('load() called after destroy()')

    // If the Timidity constructor was not invoked inside a user-initiated event
    // handler, then the AudioContext will be suspended. Attempt to resume it.
    this._audioContext.resume()

    // If a song already exists, destroy it before starting a new one
    if (this._songPtr) this._destroySong()

    this.emit('unstarted')
    this._stopInterval()

    if (!this._ready) return this.once('_ready', () => this.load(urlOrBuf))

    this.emit('buffering')

    // Save the url or buf to load. Allows detection of when a new interleaved
    // load() starts so we can abort this load.
    this._currentUrlOrBuf = urlOrBuf

    let midiBuf
    if (typeof urlOrBuf === 'string') {
      midiBuf = await this._fetch(new URL(urlOrBuf, this._baseUrl))
      // If another load() started while awaiting, abort this load
      if (this._currentUrlOrBuf !== urlOrBuf) return
    } else if (urlOrBuf instanceof Uint8Array) {
      midiBuf = urlOrBuf
    } else {
      throw new Error('load() expects a `string` or `Uint8Array` argument')
    }

    let songPtr = this._loadSong(midiBuf)

    // Are we missing instrument files?
    let missingCount = this._lib._mid_get_load_request_count(songPtr)
    if (missingCount > 0) {
      let missingInstruments = this._getMissingInstruments(songPtr, missingCount)
      debugVerbose('Fetching instruments: %o', missingInstruments)

      // Wait for all instruments to load
      await Promise.all(
        missingInstruments.map(instrument => this._fetchInstrument(instrument))
      )

      // If another load() started while awaiting, abort this load
      if (this._currentUrlOrBuf !== urlOrBuf) return

      // Retry the song load, now that instruments have been loaded
      this._lib._mid_song_free(songPtr)
      songPtr = this._loadSong(midiBuf)

      // Are we STILL missing instrument files? Then our General MIDI soundset
      // is probably missing instrument files.
      missingCount = this._lib._mid_get_load_request_count(songPtr)

      // Print out missing instrument names
      if (missingCount > 0) {
        missingInstruments = this._getMissingInstruments(songPtr, missingCount)
        debug('Playing with missing instruments: %o', missingInstruments)
      }
    }

    this._songPtr = songPtr
    this._lib._mid_song_start(this._songPtr)
    debugVerbose('Song and instruments are loaded')
  }

  _getMissingInstruments (songPtr, missingCount) {
    const missingInstruments = []
    for (let i = 0; i < missingCount; i++) {
      const instrumentPtr = this._lib._mid_get_load_request(songPtr, i)
      const instrument = this._lib.UTF8ToString(instrumentPtr)
      missingInstruments.push(instrument)
    }
    return missingInstruments
  }

  _loadSong (midiBuf) {
    const optsPtr = this._lib._mid_alloc_options(
      SAMPLE_RATE,
      AUDIO_FORMAT,
      NUM_CHANNELS,
      BUFFER_SIZE
    )

    // Copy the MIDI buffer into the heap
    const midiBufPtr = this._lib._malloc(midiBuf.byteLength)
    this._lib.HEAPU8.set(midiBuf, midiBufPtr)

    // Create a stream
    const iStreamPtr = this._lib._mid_istream_open_mem(midiBufPtr, midiBuf.byteLength)

    // Load the song
    const songPtr = this._lib._mid_song_load(iStreamPtr, optsPtr)

    // Free resources no longer needed
    this._lib._mid_istream_close(iStreamPtr)
    this._lib._free(optsPtr)
    this._lib._free(midiBufPtr)

    if (songPtr === 0) {
      return this._destroy(new Error('Failed to load MIDI file'))
    }

    return songPtr
  }

  async _fetchInstrument (instrument) {
    if (this._pendingFetches[instrument]) {
      // If this instrument is already in the process of being fetched, return
      // the existing promise to prevent duplicate fetches.
      return this._pendingFetches[instrument]
    }

    const url = new URL(instrument, this._baseUrl)
    const bufPromise = this._fetch(url)
    this._pendingFetches[instrument] = bufPromise

    const buf = await bufPromise
    this._writeInstrumentFile(instrument, buf)

    delete this._pendingFetches[instrument]

    return buf
  }

  _writeInstrumentFile (instrument, buf) {
    const folderPath = instrument
      .split('/')
      .slice(0, -1) // remove basename
      .join('/')
    this._mkdirp(folderPath)
    this._lib.FS.writeFile(instrument, buf, { encoding: 'binary' })
  }

  _mkdirp (folderPath) {
    const pathParts = folderPath.split('/')
    let dirPath = '/'
    for (let i = 0; i < pathParts.length; i++) {
      const curPart = pathParts[i]
      try {
        this._lib.FS.mkdir(`${dirPath}${curPart}`)
      } catch (err) {}
      dirPath += `${curPart}/`
    }
  }

  async _fetch (url) {
    const opts = {
      mode: 'cors',
      credentials: 'same-origin'
    }
    const response = await window.fetch(url, opts)
    if (response.status !== 200) throw new Error(`Could not load ${url}`)

    const arrayBuffer = await response.arrayBuffer()
    const buf = new Uint8Array(arrayBuffer)
    return buf
  }

  play () {
    debug('play')
    if (this.destroyed) throw new Error('play() called after destroy()')

    // If the Timidity constructor was not invoked inside a user-initiated event
    // handler, then the AudioContext will be suspended. Attempt to resume it.
    this._audioContext.resume()

    this._playing = true
    if (this._ready && !this._currentUrlOrBuf) {
      this.emit('playing')
      this._startInterval()
    }
  }

  _onAudioProcess (event) {
    const sampleCount = (this._songPtr && this._playing)
      ? this._readMidiData()
      : 0

    if (sampleCount > 0 && this._currentUrlOrBuf) {
      this._currentUrlOrBuf = null
      this.emit('playing')
      this._startInterval()
    }

    const output0 = event.outputBuffer.getChannelData(0)
    const output1 = event.outputBuffer.getChannelData(1)

    for (let i = 0; i < sampleCount; i++) {
      output0[i] = this._array[i * 2] / 0x7FFF
      output1[i] = this._array[i * 2 + 1] / 0x7FFF
    }

    for (let i = sampleCount; i < BUFFER_SIZE; i++) {
      output0[i] = 0
      output1[i] = 0
    }

    if (this._songPtr && this._playing && sampleCount === 0) {
      // Reached the end of the file
      this.seek(0)
      this.pause()
      this._lib._mid_song_start(this._songPtr)
      this.emit('ended')
    }
  }

  _readMidiData () {
    const byteCount = this._lib._mid_song_read_wave(
      this._songPtr,
      this._bufferPtr,
      BUFFER_SIZE * BYTES_PER_SAMPLE
    )
    const sampleCount = byteCount / BYTES_PER_SAMPLE

    // Was anything output? If not, don't bother copying anything
    if (sampleCount === 0) {
      return 0
    }

    this._array.set(
      this._lib.HEAP16.subarray(this._bufferPtr / 2, (this._bufferPtr + byteCount) / 2)
    )

    return sampleCount
  }

  pause () {
    debug('pause')
    if (this.destroyed) throw new Error('pause() called after destroy()')

    this._playing = false
    this._stopInterval()
    this.emit('paused')
  }

  seek (time) {
    debug('seek %d', time)
    if (this.destroyed) throw new Error('seek() called after destroy()')
    if (!this._songPtr) return // ignore seek if there is no song loaded yet

    const timeMs = Math.floor(time * 1000)
    this._lib._mid_song_seek(this._songPtr, timeMs)
    this._onTimeupdate()
  }

  get currentTime () {
    if (this.destroyed || !this._songPtr) return 0
    return this._lib._mid_song_get_time(this._songPtr) / 1000
  }

  get duration () {
    if (this.destroyed || !this._songPtr) return 1
    return this._lib._mid_song_get_total_time(this._songPtr) / 1000
  }

  /**
   * This event fires when the time indicated by the `currentTime` property
   * has been updated.
   */
  _onTimeupdate () {
    this.emit('timeupdate', this.currentTime)
  }

  _startInterval () {
    this._onTimeupdate()
    this._interval = setInterval(() => this._onTimeupdate(), 1000)
  }

  _stopInterval () {
    this._onTimeupdate()
    clearInterval(this._interval)
    this._interval = null
  }

  destroy () {
    debug('destroy')
    if (this.destroyed) throw new Error('destroy() called after destroy()')
    this._destroy()
  }

  _destroy (err) {
    if (this.destroyed) return
    this.destroyed = true

    this._stopInterval()

    this._array = null

    if (this._songPtr) {
      this._destroySong()
    }

    if (this._bufferPtr) {
      this._lib._free(this._bufferPtr)
      this._bufferPtr = 0
    }

    if (this._node) {
      this._node.disconnect()
      this._node.removeEventListener('audioprocess', this._onAudioProcess)
    }

    if (this._audioContext) {
      this._audioContext.close()
    }

    if (err) this.emit('error', err)
    debug('destroyed (err %o)', err)
  }

  _destroySong () {
    this._lib._mid_song_free(this._songPtr)
    this._songPtr = 0
  }
}

module.exports = Timidity
