// Common client-side webpack configuration used by webpack.hot.config and webpack.rails.config.

const webpack = require('webpack')
const path = require('path')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

const devBuild = process.env.NODE_ENV !== 'production'
const nodeEnv = devBuild ? 'development' : 'production'

module.exports = {

  // the project dir
  context: path.join(__dirname, '..', '..'),
  entry: {
    insights: [
      'babel-polyfill',
      './app/scenes/index.js',
      './app/scenes/explorer/scene.js'
    ]
  },
  resolve: {
    extensions: ['', '.webpack.js', '.web.js', '.js', '.jsx', '.scss', '.css', 'config.js'],
    alias: {
      '~': path.join(process.cwd(), 'app'),
      lib: path.join(process.cwd(), 'app', 'lib')
    }
  },
  postcss: function (webpack) {
    return [
      require('postcss-smart-import')({ addDependencyTo: webpack }),
      require('autoprefixer'),
      require('precss')
    ]
  },
  plugins: [
    new ExtractTextPlugin('[name].css'),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(nodeEnv)
      }
    }),
    new webpack.ProvidePlugin({
      'fetch': 'imports?this=>global!exports?global.fetch!whatwg-fetch'
    })
  ],
  module: {
    loaders: [
      { test: /\.s?css$/, loader: devBuild ? 'style!css?importLoaders=1!postcss?parser=postcss-scss' : ExtractTextPlugin.extract('style', 'css!postcss?parser=postcss-scss') },
      { test: /\.png$/, loader: 'url-loader?limit=10000&mimetype=image/png' },
      { test: /\.jpg$/, loader: 'url-loader?limit=10000&mimetype=image/jpeg' },
      { test: /\.gif$/, loader: 'url-loader?limit=10000&mimetype=image/gif' },
      { test: /\.svg$/, loader: 'url-loader?limit=10000&mimetype=image/svg+xml' },
      { test: /\.rb$/, loader: 'kea-rails-loader' },
    ]
  }
}
