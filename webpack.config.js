var path = require('path');
var webpack = require('webpack');

module.exports = {
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    })
  ],
  module: {
    loaders: [
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      },
      {
        test: /\.png$/i,
        loader: 'url-loader?limit=100000'
      },
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel' // 'babel-loader' is also a legal name to reference
      }
    ],
    noParse: [
      /jszip\.js$/
    ]
  },
  entry: './js/main.js',
  output: {
    filename: 'winamp.js',
    publicPath: '/built/',
    path: path.resolve(__dirname, 'built')
  }
};
