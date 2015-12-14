define([], function() {
  return function(base) {
    var supportsAudioApi = !!(base.AudioContext || base.webkitAudioContext);
    var supportsCanvas = !!(base.document.createElement('canvas').getContext);

    this.isCompatible = supportsAudioApi && supportsCanvas;
  };
});

