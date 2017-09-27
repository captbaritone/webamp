const webpackConfig = require("./webpack.config");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { cdnUrl } = require("./package.json");

webpackConfig.plugins = [
  new HtmlWebpackPlugin({
    template: "./index.ejs",
    filename: "../index.html",
    assetBase: cdnUrl
  }),
  new webpack.DefinePlugin({
    "process.env": {
      NODE_ENV: JSON.stringify("production")
    }
  }),
  new webpack.optimize.UglifyJsPlugin({
    sourceMap: true
  })
];

webpackConfig.entry.winamp.unshift("./js/googleAnalytics.min.js");
webpackConfig.output.publicPath = "built/";

module.exports = webpackConfig;
