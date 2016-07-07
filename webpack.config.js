var path = require('path');

module.exports = {
  resolve: {
    modulesDirectories: ['js']
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
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
