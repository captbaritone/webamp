const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

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
      filename: "index.html",
      template: "./index.html",
      chunks: ["modern"],
    }),
    // Ideally we could just do this via client-side routing, but it's tricky
    // with both the real app and this sub directory. So we just hack it to
    // duplicate the html file in both places and move on with our lives.
    new HtmlWebpackPlugin({
      filename: "./ready/index.html",
      template: "./index.html",
      chunks: ["modern"],
    }),
  ],

  performance: {
    // We do some crazy shit okay! Don't judge!
    maxEntrypointSize: 7000000,
    maxAssetSize: 7000000,
  },
  entry: {
    modern: ["./src/index.js"],
  },
  context: path.resolve(__dirname, "../"),
  output: {
    filename: "[name]-[hash].js",
    chunkFilename: "[name]-[hash].js",
    publicPath: "/",
    path: path.resolve(__dirname, "../built"),
  },
};
