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
        test: /\.css$/,
        use: [
          "style-loader",
          { loader: "css-loader", options: { importLoaders: 1 } },
          // We really only need this in prod. We could find a way to disable it in dev.
          {
            loader: "postcss-loader",
            options: {
              plugins: [
                require("cssnano"),
                require("../../scripts/postcss-optimize-data-uri-pngs"),
              ],
            },
          },
        ],
      },
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
      {
        from: "../assets",
        to: "assets",
      },
    ]),
  ],

  performance: {
    // We do some crazy shit okay! Don't judge!
    maxEntrypointSize: 7000000,
    maxAssetSize: 7000000,
  },
  entry: {
    webamp: ["./js/index.tsx"],
  },
  context: path.resolve(__dirname, "../"),
  output: {
    filename: "[name]-[hash].js",
    chunkFilename: "[name]-[hash].js",
    publicPath: "/",
    path: path.resolve(__dirname, "../built"),
  },
};
