/* Emulate the native <audio> element with Web Audio API */
Media = {
    _context: new(window.AudioContext || window.webkitAudioContext)(),
    _source: null,
    _buffer: null,
    _callbacks: {
        waiting: function(){},
        playing: function(){},
        timeupdate: function(){},
        visualizerupdate: function(){},
        ended: function(){}
    },
    _startTime: 0,
    _position: 0,
    _balance: 0,
    _playing: false,
    _loop: false,
    autoPlay: false,

    init: function() {
        // The _source node has to be recreated each time it's stopped or
        // paused, so we don't create it here.

        // Create the spliter node
        this._chanSplit = this._context.createChannelSplitter(2);

        // Create the gains for left and right
        this._leftGain = this._context.createGain();
        this._rightGain = this._context.createGain();

        // Create channel merge
        this._chanMerge = this._context.createChannelMerger(2);

        // Create the gain node for the volume control
        this._gainNode = this._context.createGain();

        // Create the analyser node for the visualizer
        this._analyser = this._context.createAnalyser();
        this._analyser.fftSize = 2048;

        // Connect all the nodes in the correct way
        // (Note, source is created and connected later)
        //
        //                 <source>
        //                    |\
        //                    | <analyser>
        //                    |
        //    (split using createChannelSplitter)
        //                    |
        //                   / \
        //                  /   \
        //             leftGain rightGain
        //                  \   /
        //                   \ /
        //                    |
        //     (merge using createChannelMerger)
        //                    |
        //                chanMerge
        //                    |
        //                   gain
        //                    |
        //               destination

        // Connect split channels to left / right gains
        this._chanSplit.connect(this._leftGain,0);
        this._chanSplit.connect(this._rightGain,1);

        // Reconnect the left / right gains to the merge node
        this._leftGain.connect(this._chanMerge, 0, 0);
        this._rightGain.connect(this._chanMerge, 0, 1);

        this._chanMerge.connect(this._gainNode);

        this._gainNode.connect(this._context.destination);

        // Kick off the animation loop
        this._draw(0);
        return this;
    },

    // Load from bufferArray
    loadBuffer: function(buffer, loadedCallback) {
        this.stop();
        this._callbacks.waiting();

        var loadAudioBuffer = function(buffer) {
            this._buffer = buffer;
            loadedCallback();
            if(this.autoPlay) {
                this.play(0);
            }
        };

        var error = function (error) {
            //console.error("failed to decode:", error);
        };
        // Decode the target file into an arrayBuffer and pass it to loadBuffer
        this._context.decodeAudioData(buffer, loadAudioBuffer.bind(this), error);
    },

    /* Properties */
    duration: function() {
        return this._buffer.duration;
    },
    timeElapsed: function() {
        return this._position;
    },
    timeRemaining: function() {
        return this.duration() - this.timeElapsed();
    },
    percentComplete: function() {
        return (this.timeElapsed() / this.duration()) * 100;
    },
    channels: function() {
        if(!this._buffer) {
            return 0;
        }
        return this._buffer.numberOfChannels;
    },
    sampleRate: function() {
        return this._buffer.sampleRate;
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
        if(this._buffer) {
            this._source = this._context.createBufferSource();
            this._source.buffer = this._buffer;
            this._source.connect(this._analyser);
            this._source.connect(this._chanSplit);

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
        this._updatePosition();
    },

    stop: function() {
        this._silence();
        this._position = 0;
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
        this.seekToTime(seekTime);
    },

    // From 0-1
    setVolume: function(volume) {
        this._gainNode.gain.value = volume;
    },

    getVolume: function() {
        return this._gainNode.gain.value;
    },

    // From -100 to 100
    setBalance: function(balance) {
        var changeVal = Math.abs(balance) / 100;

        // Hack for Firefox. Having either channel set to 0 seems to revert us
        // to equal balance.
        changeVal = changeVal - 0.00000001;

        if(balance > 0) { // Right
            this._leftGain.gain.value = 1 - changeVal;
            this._rightGain.gain.value = 1;
        }
        else if(balance < 0) // Left
        {
            this._leftGain.gain.value = 1;
            this._rightGain.gain.value = 1 - changeVal;
        }
        else // Center
        {
            this._leftGain.gain.value = 1;
            this._rightGain.gain.value = 1;
        }
        this._balance = balance;
    },

    getBalance: function() {
        return this._balance;
    },

    toggleRepeat: function() {
        this._loop = !this._loop;
    },

    toggleShuffle: function() {
        // Implement this when we support playlists
    },

    /* Listeners */
    addEventListener: function(event, callback) {
        this._callbacks[event] = callback;
    },

    seekToTime: function(time) {
        // Make sure we are within range
        time = Math.min(time, this.duration());
        time = Math.max(time, 0);
        this.play(time);
    },

    // There is probably a more reasonable way to do this, rather than having
    // it always running.
    _draw: function() {
        if(this._playing) {
            this._updatePosition();
            this._callbacks.timeupdate();

            // _updatePosition might have stoped the playing
            if(this._playing) {
                this._callbacks.visualizerupdate(this._analyser);
            }
        }
        window.requestAnimationFrame(this._draw.bind(this));
    },

    _updatePosition: function() {
        this._position = this._context.currentTime - this._startTime;
        if(this._position >= this._buffer.duration && this._playing) {
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
};
