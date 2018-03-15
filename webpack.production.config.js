const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const config = require("./webpack.config");

config.devtool = "source-map";

config.plugins = [
  new webpack.DefinePlugin({
    "process.env": {
      NODE_ENV: JSON.stringify("production")
    },
    SENTRY_DSN: JSON.stringify(
      "https://12b6be8ef7c44f28ac37ab5ed98fd294@sentry.io/146021"
    )
  }),
  new webpack.optimize.UglifyJsPlugin({
    sourceMap: true
  }),
  new HtmlWebpackPlugin({
    template: "./index.html"
  })
];

config.output.publicPath = `/`;
config.output.filename = "[name]-[hash].js";

config.entry.winamp.unshift("./js/googleAnalytics.min.js");

module.exports = config;
