/* Helpful wrapper for the native <audio> element */
Media = {
    init: function(audioId) {
        this.audio = document.getElementById(audioId);
        return this;
    },

    /* Properties */
    duration: function() {
        return this.audio.duration;
    },
    timeElapsed: function() {
        return this.audio.currentTime;
    },
    timeRemaining: function() {
        return this.audio.duration - this.audio.currentTime;
    },
    percentComplete: function() {
        return (this.audio.currentTime / this.audio.duration) * 100;
    },

    /* Actions */
    previous: function() {
        // Implement this when we support playlists
    },
    play: function() {
        this.audio.play();
    },
    pause: function() {
        this.audio.pause();
    },
    stop: function() {
        this.audio.pause();
        this.audio.currentTime = 0;
    },
    next: function() {
        // Implement this when we support playlists
    },
    toggleRepeat: function() {
        this.audio.loop = !this.audio.loop;
    },
    toggleShuffle: function() {
        // Not implemented
    },

    /* Actions with arguments */
    seekToPercentComplete: function(percent) {
        this.audio.currentTime = this.audio.duration * (percent/100);
    },
    // From 0-1
    setVolume: function(volume) {
        this.audio.volume = volume;
    },
    loadFile: function(file) {
        this.audio.setAttribute('src', file);
    },

    /* Listeners */
    addEventListener: function(event, callback) {
        this.audio.addEventListener(event, callback);
    }
}
