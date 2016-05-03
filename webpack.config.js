module.exports = {
  resolve: {
    modulesDirectories: ['js']
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      }
    ],
    noParse: [
      /jszip\.js$/
    ]
  },
  entry: './js/main.js',
  output: {
    filename: 'winamp.js',
    path: './built'
  }
};
