# Minimal Example

This example includes Webamp in a Webpack bundle. The audio file and skin are fetched from a free CDN at run time.

**Note:** Currently Webamp is published to NPM as a single bundle which includes all of its dependencies. This means that no matter what you do, Webamp is going to bring along it's own React, Redux, JSZip, etc. If you have a use case where you would like Webamp to share some or all of these dependencies with your own application, please file an issue and I can look into it.

To try it out:

```
$ git clone git@github.com:captbaritone/webamp.git
$ cd webamp/examples/webpack/
$ npm install
$ npm run build
$ open index.html
```
