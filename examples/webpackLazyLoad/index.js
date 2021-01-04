import Webamp from "webamp"; // eslint-disable-line import/no-unresolved

new Webamp({
  initialTracks: [
    {
      metaData: {
        artist: "DJ Mike Llama",
        title: "Llama Whippin' Intro",
      },
      // NOTE: Your audio file must be served from the same domain as your HTML
      // file, or served with permissive CORS HTTP headers:
      // https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
      url:
        "https://cdn.jsdelivr.net/gh/captbaritone/webamp@43434d82cfe0e37286dbbe0666072dc3190a83bc/mp3/llama-2.91.mp3",
      duration: 5.322286,
    },
  ],
  __butterchurnOptions: {
    importButterchurn: () => {
      // Only load butterchurn when music starts playing to reduce initial page load
      return import("butterchurn");
    },
    getPresets: async () => {
      // Load presets from preset URL mapping on demand as they are used
      const resp = await fetch(
        // NOTE: Your preset file must be served from the same domain as your HTML
        // file, or served with permissive CORS HTTP headers:
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
        "https://unpkg.com/butterchurn-presets-weekly@0.0.2/weeks/week1/presets.json"
      );
      const namesToPresetUrls = await resp.json();
      return Object.keys(namesToPresetUrls).map((name) => {
        return { name, butterchurnPresetUrl: namesToPresetUrls[name] };
      });
    },
    butterchurnOpen: true,
  },
  __initialWindowLayout: {
    main: { position: { x: 0, y: 0 } },
    equalizer: { position: { x: 0, y: 116 } },
    playlist: { position: { x: 0, y: 232 }, size: [0, 4] },
    milkdrop: { position: { x: 275, y: 0 }, size: [7, 12] },
  },
}).renderWhenReady(document.getElementById("app"));
