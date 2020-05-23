const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlWebpackInlineSVGPlugin = require("html-webpack-inline-svg-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  resolve: {
    extensions: [".js", ".ts", ".tsx"],
  },
  module: {
    rules: [
      {
        test: /\.(js|ts|tsx)?$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
          options: {
            envName: "production",
          },
        },
      },
      {
        test: /\.(wsz|wal|mp3|png|ico|jpg|svg)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              emitFile: true,
              name: "[path][name]-[hash].[ext]",
            },
          },
        ],
      },
    ],
    noParse: [/jszip\.js$/],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./index.html",
      chunks: ["webamp"],
    }),
    new HtmlWebpackInlineSVGPlugin({ runPreEmit: true }),
    new CopyWebpackPlugin([
      {
        from: "./js/delete-service-worker.js",
        to: "service-worker.js",
        force: true,
      },
    ]),
  ],

  performance: {
    // We do some crazy shit okay! Don't judge!
    maxEntrypointSize: 7000000,
    maxAssetSize: 7000000,
  },
  entry: {
    webamp: ["./js/index.js"],
  },
  context: path.resolve(__dirname, "../"),
  output: {
    filename: "[name]-[hash].js",
    chunkFilename: "[name]-[hash].js",
    publicPath: "/",
    path: path.resolve(__dirname, "../built"),
  },
};
