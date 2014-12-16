Browser = {
    isCompatible: function() {
        return this._supportsAudioApi() && this._supportsCanvas();
    },

    _supportsAudioApi: function() {
        return !!(window.AudioContext || window.webkitAudioContext);
    },
    _supportsCanvas: function() {
        return !!document.createElement('canvas').getContext;
    }

}

