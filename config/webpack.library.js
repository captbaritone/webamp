const path = require("path");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const UnminifiedWebpackPlugin = require("unminified-webpack-plugin");

module.exports = {
  mode: "production",
  resolve: {
    extensions: [".js", ".ts", ".tsx"]
  },
  node: {
    // Consider suggesting jsmediatags use: https://github.com/feross/is-buffer
    // Cuts 22k
    Buffer: false,
    fs: "empty"
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.(js|ts|tsx)$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
          options: {
            envName: "library"
          }
        }
      },
      {
        test: /\.(wsz|mp3)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              emitFile: true,
              name: "[path][name]-[hash].[ext]"
            }
          }
        ]
      }
    ],
    noParse: [/jszip\.js$/]
  },
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: "static",
      reportFilename: "library-report.html",
      openAnalyzer: false
    }),
    // Also generate non-minified bundles.
    new UnminifiedWebpackPlugin()
  ],
  performance: {
    // We do some crazy shit okay! Don't judge!
    maxEntrypointSize: 9000000,
    maxAssetSize: 9000000
  },
  entry: {
    "bundle.min": "./js/webamp.js",
    "lazy-bundle.min": "./js/webampLazy.tsx"
  },
  output: {
    path: path.resolve(__dirname, "../built"),
    filename: "webamp.[name].js",
    library: "Webamp",
    libraryTarget: "umd",
    libraryExport: "default"
  }
};
