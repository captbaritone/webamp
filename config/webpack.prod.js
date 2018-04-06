const webpack = require("webpack");
const merge = require("webpack-merge");
const workboxPlugin = require("workbox-webpack-plugin");
const GitRevisionPlugin = require("git-revision-webpack-plugin");
const common = require("./webpack.common.js");

const gitRevisionPlugin = new GitRevisionPlugin();

const config = merge(common, {
  devtool: "source-map",
  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("production")
      },
      SENTRY_DSN: JSON.stringify(
        "https://12b6be8ef7c44f28ac37ab5ed98fd294@sentry.io/146021"
      ),
      COMMITHASH: JSON.stringify(gitRevisionPlugin.commithash())
    }),
    new webpack.optimize.UglifyJsPlugin({
      // TODO: Is this needed with the devtool setting above?
      sourceMap: true
    }),
    new workboxPlugin.GenerateSW({
      // Note: CloudFlare is configued to not cache this file, as suggested in the:
      // "Avoid changing the URL of your service worker script" sectio of:
      // https://developers.google.com/web/fundamentals/primers/service-workers/lifecycle
      swDest: "service-worker.js",
      clientsClaim: true,
      skipWaiting: true
    })
  ]
});

config.entry.winamp.unshift("./js/googleAnalytics.min.js");

module.exports = config;
