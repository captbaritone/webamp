export default function(base) {
  const supportsAudioApi = !!(base.AudioContext || base.webkitAudioContext);
  const supportsCanvas = !!base.document.createElement("canvas").getContext;
  const supportsPromises = typeof Promise !== "undefined";

  this.isCompatible = supportsAudioApi && supportsCanvas && supportsPromises;
}
