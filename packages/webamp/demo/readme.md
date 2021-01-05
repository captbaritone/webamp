# Webamp.org

The Webamp demo site, [webamp.org](https://webamp.org), uses the same interface as the NPM module but adds the following functionality by utilizing Webamp's public API

- Error reporting using [Sentry](https://sentry.io)
- Analytics using [Google Analytics](https://analytics.google.com/analytics/web/)
- Updating document's title to reflect the currently playing track
- [Media Session API](https://developer.mozilla.org/en-US/docs/Web/API/Media_Session_API) integration

Additionally, it makes use of some private Webamp APIs to add the following functionality:

- [Butterchun](https://github.com/jberg/butterchurn) integration to render [MilkDrop](https://en.wikipedia.org/wiki/MilkDrop) visualizations. We intend to make this part of the public API soon.
- "Screenshot" mode `https://webamp.org/?screenshot=1` which can be used together with [Puppeteer](https://github.com/GoogleChrome/puppeteer) to automate the generation of Winamp skin screenshots

## Production Builds

To do an optimized build of the demo site, you can run:

    yarn run build

If you wish to test this build locally, run:

    yarn run serve

Then open the local ip/port that is output to the console in your browser.

## Deploying

[Netlify](https://www.netlify.com/) watches GitHub for new versions of master. When a new version is seen, it is automatically built using `npm run build` and pushed to the server. Additionally, Netlify will run a build on every pull request and include a link under the heading "Deploy preview ready!". This enables easy high level testing of pull requests.

In short, deploying should be as simple as pushing a commit to master.

Additionally, if you want to fork the project, deploying should be as simple as setting up a free Netlify account

### Advanced Usage

There are some "feature flags" which you can manipulate by passing a specially crafted URL hash. Simply supply a JSON blob after the `#` of the URL to change these settings:

- `skinUrl` (string) Url of the default skin to use. Note, this file must be served with the correct Allows Origin header.
- `audioUrl` (string) Url of the default audio file to use. Note, this file must be served with the correct Allows Origin header.
- `initialState` (object) Override the [initial Redux state](packages/webamp/js/reducers/index.ts). Values from this object will be recursively merged into the actual default state.

**Note:** These are intended mostly as development tools and are subject to change at any time.