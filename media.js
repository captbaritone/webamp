(function(window, undefined) {

    var callbacks = {
        waiting: function() {},
        playing: function() {},
        timeupdate: function() {},
        visualizerupdate: function() {},
        ended: function() {}
    };

    var startTime = 0;
    var position = 0;
    var playing = false;
    var loop = false;
    // var autoPlay= false;  // its public, put it in self

    var audio = { // Anything to do with webaudio
        context: new(window.AudioContext || window.webkitAudioContext)(),
        source: null,
        analyser: null,
        buffer: null,
        chanSplit: null,
        leftGain: null,
        rightGain: null,
        chanMerge: null,
        gainNode: null
    }

    function init() {
        // The _source node has to be recreated each time it's stopped or
        // paused, so we don't create it here.

        // Create the spliter node
        audio.chanSplit = audio.context.createChannelSplitter(2);

        // Create the gains for left and right
        audio.leftGain = audio.context.createGain();
        audio.rightGain = audio.context.createGain();

        // Create channel merge
        audio.chanMerge = audio.context.createChannelMerger(2);

        // Create the gain node for the volume control
        audio.gainNode = audio.context.createGain();

        // Create the analyser node for the visualizer
        audio.analyser = audio.context.createAnalyser();
        audio.analyser.fftSize = 2048;

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
        audio.chanSplit.connect(audio.leftGain, 0);
        audio.chanSplit.connect(audio.rightGain, 1);

        // Reconnect the left / right gains to the merge node
        audio.leftGain.connect(audio.chanMerge, 0, 0);
        audio.rightGain.connect(audio.chanMerge, 0, 1);

        audio.chanMerge.connect(audio.gainNode);

        audio.gainNode.connect(audio.context.destination);
        return self;
    };

    // Load from bufferArray
    function loadBuffer(_buffer, loadedCallback) {
        stop();
        callbacks.waiting();

        var loadAudioBuffer = function(_buffer) {
            audio.buffer = _buffer;
            loadedCallback();
            if (self.autoPlay) {
                play(0);
            }
            _draw(0);
        }

        var error = function(error) {
                //console.error("failed to decode:", error);
            }
            // Decode the target file into an arrayBuffer and pass it to loadBuffer
        audio.context.decodeAudioData(_buffer, loadAudioBuffer, error);
    };

    /* Properties */
    function duration() {
        return audio.buffer.duration;
    };

    function timeElapsed() {
        return audio.context.currentTime - startTime;
    };

    function timeRemaining() {
        return duration() - timeElapsed();
    };

    function percentComplete() {
        return (timeElapsed() / duration()) * 100;
    };

    function channels() {
        if (!audio.buffer) {
            return 0;
        }
        return audio.buffer.numberOfChannels;
    };

    function sampleRate() {
        return audio.buffer.sampleRate;
    };

    /* Actions */
    function previous() {
        // Implement this when we support playlists
    };

    function play(_position) {
        if (playing) {
            // So we don't get a race condition with _position getting overwritten
            pause();
        }
        if (audio.buffer) {
            audio.source = audio.context.createBufferSource();
            audio.source.buffer = audio.buffer;
            audio.source.connect(audio.analyser);
            audio.source.connect(audio.chanSplit);

            position = typeof _position !== 'undefined' ? _position : position;
            startTime = audio.context.currentTime - position;
            audio.source.start(0, position);
            playing = true;
            callbacks.playing();
        }
    };

    function pause() {
        if (!playing) {
            return;
        }
        _silence();
        position = audio.context.currentTime - startTime;
    };

    function stop() {
        _silence();
        position = 0;
    };

    function _silence() {
        if (audio.source) {
            audio.source.stop(0);
            audio.source = null;
        }
        playing = false;
    };

    /* Actions with arguments */
    function seekToPercentComplete(percent) {
        var seekTime = duration() * (percent / 100);
        seekToTime(seekTime);
    };

    // From 0-1
    function setVolume(volume) {
        audio.gainNode.gain.value = volume;
    };

    // From -100 to 100
    function setBalance(balance) {
        var changeVal = Math.abs(balance) / 100;

        // Hack for Firefox. Having either channel set to 0 seems to revert us
        // to equal balance.
        var changeVal = changeVal - .00000001;

        if (balance > 0) { // Right
            audio.leftGain.gain.value = 1 - changeVal;
            audio.rightGain.gain.value = 1;
        } else if (balance < 0) // Left
        {
            audio.leftGain.gain.value = 1;
            audio.rightGain.gain.value = 1 - changeVal;
        } else // Center
        {
            audio.leftGain.gain.value = 1;
            audio.rightGain.gain.value = 1;
        }
    };

    function toggleRepeat() {
        loop = !loop;
    };

    /* Listeners */
    function addEventListener(event, callback) {
        callbacks[event] = callback;
    };

    function seekToTime(time) {
        // Make sure we are within range
        time = Math.min(time, duration());
        time = Math.max(time, 0);
        play(time);
    };

    // There is probably a more reasonable way to do this, rather than having
    // it always running.
    function _draw() {
        if (playing) {
            _updatePosition();
            callbacks.timeupdate();

            // _updatePosition might have stoped the playing
            if (playing) {
                callbacks.visualizerupdate(audio.analyser);
            }
        }
        window.requestAnimationFrame(_draw);
    };

    function _updatePosition() {
        position = audio.context.currentTime - startTime;
        if (position >= audio.buffer.duration) {
            // Idealy we could use _source.loop, but it makes updating the position tricky
            if (loop) {
                play(0);
            } else {
                stop();
                callbacks.ended();
            }
        }
        return position;
    }

    // Declare all public (on winamp) stuff here
    var self = {
        init: init,
        loadBuffer: loadBuffer,
        duration: duration,
        timeElapsed: timeElapsed,
        timeRemaining: timeRemaining,
        percentComplete: percentComplete,
        channels: channels,
        sampleRate: sampleRate,
        previous: previous,
        play: play,
        pause: pause,
        stop: stop,
        seekToPercentComplete: seekToPercentComplete,
        setVolume: setVolume,
        setBalance: setBalance,
        toggleRepeat: toggleRepeat,
        addEventListener: addEventListener,
        seekToTime: seekToTime,
        autoPlay: false,
        audio: audio
    }

    // There can be only one....
    if(!window.Media) window.Media = self;

 })(window);