import Webamp from "webamp/lazy";

const webamp = new Webamp({
  initialTracks: [
    {
      metaData: {
        artist: "DJ Mike Llama",
        title: "Llama Whippin' Intro",
      },
      // NOTE: Your audio file must be served from the same domain as your HTML
      // file, or served with permissive CORS HTTP headers:
      // https://docs.webamp.org/docs/guides/cors
      url: "https://cdn.jsdelivr.net/gh/captbaritone/webamp@43434d82cfe0e37286dbbe0666072dc3190a83bc/mp3/llama-2.91.mp3",
      duration: 5.322286,
    },
  ],
  windowLayout: {
    main: { position: { left: 0, top: 0 } },
    equalizer: { position: { left: 0, top: 116 } },
    playlist: {
      position: { left: 0, top: 232 },
      size: { extraHeight: 4, extraWidth: 0 },
    },
    milkdrop: {
      position: { left: 275, top: 0 },
      size: { extraHeight: 12, extraWidth: 7 },
    },
  },
  requireJSZip: async () => {
    const JSZip = await import("jszip");
    return JSZip.default;
  },
  // @ts-ignore
  requireMusicMetadata: async () => {
    return await import("music-metadata");
  },
  __butterchurnOptions: {
    // @ts-ignore
    importButterchurn: () => import("butterchurn"),
    // @ts-ignore
    getPresets: async () => {
      const butterchurnPresets = await import(
        // @ts-ignore
        "butterchurn-presets/dist/base.js"
      );
      // Convert the presets object
      return Object.entries(butterchurnPresets.default).map(
        ([name, preset]) => {
          return { name, butterchurnPresetObject: preset };
        }
      );
    },
    butterchurnOpen: true,
  },
});

webamp.renderWhenReady(document.getElementById("app")!);
