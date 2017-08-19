const { hash } = window.location;
// Turn on the incomplete playlist window
export const playlistEnabled = hash.includes("playlist");
// Turn on the incomplete equalizer window
export const equalizerEnabled = hash.includes("equalizer");
export const noMarquee = hash.includes("!marquee");
