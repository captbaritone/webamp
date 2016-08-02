const path = require('path');

module.exports = {
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
  entry: './js/index.js',
  output: {
    filename: 'winamp.js',
    publicPath: '/built/',
    path: path.resolve(__dirname, 'built')
  }
};
