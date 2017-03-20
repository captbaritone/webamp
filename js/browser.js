export default function(base) {
  const supportsAudioApi = !!(base.AudioContext || base.webkitAudioContext);
  const supportsCanvas = !!base.document.createElement("canvas").getContext;

  this.isCompatible = supportsAudioApi && supportsCanvas;
}
