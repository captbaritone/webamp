const config = require("./webpack.config");
const webpack = require("webpack");

config.plugins = (config.plugins || []).concat([
  new webpack.DefinePlugin({
    "process.env": {
      NODE_ENV: JSON.stringify("production")
    }
  }),
  new webpack.optimize.UglifyJsPlugin({
    sourceMap: true
  })
]);

config.entry.winamp.unshift("./js/googleAnalytics.min.js");

module.exports = config;
