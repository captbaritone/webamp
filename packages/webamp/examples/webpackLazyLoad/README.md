# Minimal Lazy Loading Example

## API is still being finalized and may change when released

This example includes Webamp in a Webpack bundle. The audio file and skin are fetched from a free CDN at run time.  Milkdrop and visualizer presets are lazy loaded after playing starts.

**Note:** Currently Webamp is published to NPM as a single bundle which includes all of its dependencies. This means that no matter what you do, Webamp is going to bring along it's own React, Redux, JSZip, etc. If you have a use case where you would like Webamp to share some or all of these dependencies with your own application, please file an issue and I can look into it.

To try it out:

```
$ git clone git@github.com:captbaritone/webamp.git
$ cd webamp/examples/webpackLazyLoad/
$ npm install
$ npm run build
$ open index.html
```
