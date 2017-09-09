import { cdnUrl } from "../package.json";

const { hash } = window.location;
let config = {};
if (hash) {
  try {
    config = JSON.parse(hash.slice(1));
  } catch (e) {
    console.error("Failed to decode config from hash: ", e);
  }
}

const or = (value, fallback) => (value === undefined ? fallback : value);

const assetBase = process.env.NODE_ENV === "production" ? cdnUrl : "";
// Turn on the incomplete playlist window
export const skinUrl = or(config.skinUrl, `${assetBase}skins/base-2.91.wsz`);
export const audioUrl = or(config.audioUrl, `${assetBase}mp3/llama-2.91.mp3`);
export const playlistEnabled = config.playlist || false;
// Turn on the beta equalizer window. This flag is here so we can easily turn it off again.
export const equalizerEnabled = true;
export const noMarquee = config.noMarquee || false;
export const hideAbout = config.hideAbout || false;
export const initialState = config.initialState || undefined;
