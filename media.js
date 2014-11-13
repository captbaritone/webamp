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
    this.percentComplete = function() {
        return (this.audio.currentTime / this.audio.duration) * 100;
    }

    /* Actions */
    this.previous = function() {
        // Implement this when we support playlists
    }
    this.play = function() {
        this.audio.play();
    }
    this.pause = function() {
        this.audio.pause();
    }
    this.stop = function() {
        this.audio.pause();
        this.audio.currentTime = 0;
    }
    this.next = function() {
        // Implement this when we support playlists
    }
    this.toggleRepeat = function() {
        this.audio.loop = !this.audio.loop;
    }
    this.toggleShuffle = function() {
        // Not implemented
    }

    /* Actions with arguments */
    this.seekToPercentComplete = function(percent) {
        this.audio.currentTime = this.audio.duration * (percent/100);
    }
    // From 0-1
    this.setVolume = function(volume) {
        this.audio.volume = volume;
    }
    this.loadFile = function(file) {
        this.audio.setAttribute('src', file);
    }

    /* Listeners */
    this.addEventListener = function(event, callback) {
        this.audio.addEventListener(event, callback);
    }
}
