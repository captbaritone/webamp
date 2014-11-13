/* Helpful wrapper for the native <audio> element */
function Media (audioId) {
    this.audio = document.getElementById(audioId);

    /* Properties */
    this.timeElapsed = function() {
        return this.audio.currentTime;
    }
    this.timeRemaining = function() {
        return this.audio.duration - this.audio.currentTime;
    }
    this.timeElapsedObject = function() {
        return this._timeObject(this.timeElapsed());
    }
    this.timeRemainingObject = function() {
        return this._timeObject(this.timeRemaining());
    }
    this.percentComplete = function() {
        return (this.audio.currentTime / this.audio.duration) * 100;
    }

    /* Actions */
    this.previous = function() {
        // Implement this when we support playlists
    };
    this.play = function() {
        this.audio.play();
    };
    this.pause = function() {
        this.audio.pause();
    };
    this.stop = function() {
        this.audio.pause();
        this.audio.currentTime = 0;
    };
    this.next = function() {
        // Implement this when we support playlists
    };
    this.toggleRepeat = function() {
        this.audio.loop = !this.audio.loop;
    };
    this.toggleShuffle = function() {
        // Not implemented
    };

    /* Actions with arguments */
    this.seekToPercentComplete = function(percent) {
        this.audio.currentTime = this.audio.duration * (percent/100);
    };
    // From 0-1
    this.setVolume = function(volume) {
        this.audio.volume = volume;
    };
    this.loadFile = function(file) {
        this.audio.setAttribute('src', file);
    };

    /* Listeners */
    this.addEventListener = function(event, callback) {
        this.audio.addEventListener(event, callback);
    };

    /* Helpers */
    // TODO: Move this to the Winamp object
    this._timeObject = function(time) {
        var minutes = Math.floor(time / 60);
        var seconds = time - (minutes * 60);

        return [
            Math.floor(minutes / 10),
            Math.floor(minutes % 10),
            Math.floor(seconds / 10),
            Math.floor(seconds % 10)
        ];
    }
}
