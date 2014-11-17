/* Emulate the native <audio> element with Web Audio API */
Media = {
    _context: new(window.AudioContext || window.webkitAudioContext)(),
    _source: null,
    _buffer: null,
    _callbacks: {
        waiting: function(){},
        playing: function(){},
        timeupdate: function(){},
        ended: function(){}
    },
    _startTime: 0,
    _position: 0,
    _playing: false,
    _loop: false,
    autoPlay: false,

    init: function() {
        this._gainNode = this._context.createGain();
        return this;
    },

    // Load from bufferArray
    loadBuffer: function(buffer) {
        this.stop();
        this._callbacks.waiting();

        var loadAudioBuffer = function(buffer) {
            this._buffer = buffer;
            if(this.autoPlay) {
                this.play(0);
            }
            this._draw(0);
        }

        var error = function (error) {
            //console.error("failed to decode:", error);
        }
        // Decode the target file into an arrayBuffer and pass it to loadBuffer
        this._context.decodeAudioData(buffer, loadAudioBuffer.bind(this), error);
    },

    /* Properties */
    duration: function() {
        return this._buffer.duration;
    },
    timeElapsed: function() {
        return this._context.currentTime - this._startTime;
    },
    timeRemaining: function() {
        return this.duration() - this.timeElapsed();
    },
    percentComplete: function() {
        return (this.timeElapsed() / this.duration()) * 100;
    },

    /* Actions */
    previous: function() {
        // Implement this when we support playlists
    },
    play: function(position) {
        if(this._playing) {
            // So we don't get a race condition with _position getting overwritten
            this.pause();
        }
        this._source = this._context.createBufferSource();
        if(this._buffer) {
            this._source.buffer = this._buffer;
            this._source.connect(this._gainNode);
            this._gainNode.connect(this._context.destination);

            this._position = typeof position !== 'undefined' ? position : this._position;
            this._startTime = this._context.currentTime - this._position;
            this._source.start(0, this._position);
            this._playing = true;
            this._callbacks.playing();
        }
    },
    pause: function() {
        if(!this._playing) {
            return;
        }
        this._silence();
        this._position = this._context.currentTime - this._startTime;
    },

    stop: function() {
        this._silence();
        this._position = 0;
        this._callbacks.ended();
    },

    _silence: function() {
        if(this._source) {
            this._source.stop(0);
            this._source = null;
        }
        this._playing = false;
    },

    /* Actions with arguments */
    seekToPercentComplete: function(percent) {
        var seekTime = this.duration() * (percent / 100);
        this._seekToTime(seekTime);
    },

    // From 0-1
    setVolume: function(volume) {
        this._gainNode.gain.value = volume;
    },

    // From -100 to 100
    setBalance: function(balance) {
        // TODO
    },

    toggleRepeat: function() {
        this._loop = !this._loop;
    },

    /* Listeners */
    addEventListener: function(event, callback) {
        this._callbacks[event] = callback;
    },

    _seekToTime: function(time) {
        if (this._playing) {
            this.play(time);
        } else {
            this._position = time;
        }
    },

    _draw: function() {
        if(this._playing) {
            this._updatePosition();
            this._callbacks.timeupdate();
        }
        window.requestAnimationFrame(this._draw.bind(this));
    },

    _updatePosition: function() {
        this._position = this._context.currentTime - this._startTime;
        if(this._position >= this._buffer.duration) {
            // Idealy we could use _source.loop, but it makes updating the position tricky
            if(this._loop) {
                this.play(0);
            } else {
                this.stop();
                this._callbacks.ended();
            }
        }
        return this._position;
    }
}
