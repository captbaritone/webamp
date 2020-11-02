const webpack = require("webpack");
const merge = require("webpack-merge");
const common = require("./webpack.common.js");

module.exports = merge(common, {
  devtool: "eval-cheap-module-source-map",
  mode: "development",
  devServer: {
    overlay: true,
  },
  plugins: [
    new webpack.DefinePlugin({
      SENTRY_DSN: JSON.stringify(
        "https://c8c64ef822f54240901bc64f88c234d8@sentry.io/146022"
      ),
    }),
  ],
});
