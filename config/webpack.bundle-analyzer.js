const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;

const merge = require("webpack-merge");
const prod = require("./webpack.prod.js");

const config = merge(prod, {
  plugins: [new BundleAnalyzerPlugin()]
});

module.exports = config;
