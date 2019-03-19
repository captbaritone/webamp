const webpack = require("webpack");
const merge = require("webpack-merge");
const workboxPlugin = require("workbox-webpack-plugin");
const GitRevisionPlugin = require("git-revision-webpack-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

const common = require("./webpack.common.js");

const gitRevisionPlugin = new GitRevisionPlugin();

const config = merge(common, {
  devtool: "source-map",
  mode: "production",
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: "static",
      reportFilename: "prod-report.html",
      openAnalyzer: false,
    }),
    new webpack.DefinePlugin({
      SENTRY_DSN: JSON.stringify(
        "https://12b6be8ef7c44f28ac37ab5ed98fd294@sentry.io/146021"
      ),
      COMMITHASH: JSON.stringify(gitRevisionPlugin.commithash()),
    }),
    new workboxPlugin.GenerateSW({
      swDest: "service-worker.js",
      // importWorkboxFrom: "local",
      clientsClaim: true,
      skipWaiting: true,
      // Safari (mobile and desktop) seems to have CORs issues when loading
      // .mp3s from service workers.
      exclude: [/\.mp3/, /\.wsz/],
    }),
  ],
});

config.entry.webamp.unshift("./js/googleAnalytics.min.js");

module.exports = config;
