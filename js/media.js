/* Emulate the native <audio> element with Web Audio API */
define([],
function() {
    return function() {
        this._context = new(window.AudioContext || window.webkitAudioContext)();
        this.audio = document.createElement('audio');
        this.visualizerUpdateCallback =  function() { /* no op */};
        this._balance = 0;
        this.audio.setAttribute('crossOrigin', 'anonymous');

        this._source = this._context.createMediaElementSource(this.audio);

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

        this._source.connect(this._analyser);

        this._source.connect(this._chanSplit);

        // Connect split channels to left / right gains
        this._chanSplit.connect(this._leftGain,0);
        this._chanSplit.connect(this._rightGain,1);

        // Reconnect the left / right gains to the merge node
        this._leftGain.connect(this._chanMerge, 0, 0);
        this._rightGain.connect(this._chanMerge, 0, 1);

        this._chanMerge.connect(this._gainNode);

        this._gainNode.connect(this._context.destination);

        // Load from url
        this.loadUrl = function(url) {
            this.audio.src = url;
        };

        this.setAutoPlay = function(autoPlay) {
            this.audio.autoplay = autoPlay;
        };

        /* Properties */
        this.duration = function() {
            return this.audio.duration;
        };

        this.timeElapsed = function() {
            return this.audio.currentTime;
        };

        this.timeRemaining = function() {
            return this.duration() - this.timeElapsed();
        };
        this.percentComplete = function() {
            return (this.timeElapsed() / this.duration()) * 100;
        };
        this.channels = function() {
            return this._source.channelCount;
        };
        this.sampleRate = function() {
            return this._context.sampleRate;
        };

        /* Actions */
        this.previous = function() {
            // Implement this when we support playlists
        };
        this.play = function(position) {
            this.audio.play();
        };
        this.pause = function() {
            this.audio.pause();
        };
        this.paused = function() {
            return this.audio.paused;
        };

        this.stop = function() {
            this.seekToTime(0);
            this.pause();
        };

        /* Actions with arguments */
        this.seekToPercentComplete = function(percent) {
            var seekTime = this.duration() * (percent / 100);
            this.seekToTime(seekTime);
        };

        // From 0-1
        this.setVolume = function(volume) {
            this._gainNode.gain.value = volume;
        };

        this.getVolume = function() {
            return this._gainNode.gain.value;
        },

        // From -100 to 100
        this.setBalance = function(balance) {
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
        };

        this.getBalance = function() {
            return this._balance;
        };

        this.toggleRepeat = function() {
            this.audio.loop = !this.audio.loop;
        };

        this.toggleShuffle = function() {
            // Implement this when we support playlists
        };

        /* Listeners */
        this.addEventListener = function(event, callback) {
            if(event === 'visualizerupdate') {
                this.visualizerUpdateCallback = callback;
            } else {
                return this.audio.addEventListener(event, callback);
            }
        };

        this.seekToTime = function(time) {
            // Make sure we are within range
            time = Math.min(time, this.duration());
            time = Math.max(time, 0);
            this.audio.currentTime = time;
        };

        // There is probably a more reasonable way to do this, rather than having
        // it always running.
        this._draw = function() {
            if(!this.paused()) {
                this.visualizerUpdateCallback(this._analyser);
            }
            window.requestAnimationFrame(this._draw.bind(this));
        };

        // Kick off the animation loop
        this._draw(0);

        return this;
    };
});
