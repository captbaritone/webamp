import Webamp from "../../../packages/webamp/js/webamp";

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
  },
});

// Container smaller than body
const container = document.getElementById("app");
container!.style.position = "absolute";
container!.style.left = "20px";
container!.style.top = "20px";
container!.style.right = "120px";
container!.style.bottom = "120px";
container!.style.backgroundColor = "lightyellow";

webamp.renderWhenReady(container!, true);
