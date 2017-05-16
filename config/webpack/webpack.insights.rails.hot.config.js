// Run with Rails server like this:
// rails s
// cd client && babel-node server-rails-hot.js
// Note that Foreman (Procfile.dev) has also been configured to take care of this.

const path = require('path')
const webpack = require('webpack')

const config = require('./webpack.insights.base.config')

const hotRailsPort = process.env.HOT_RAILS_PORT || 3350

Object.keys(config.entry).filter(k => k !== 'vendor').forEach(k => {
  config.entry[k].unshift(
    // Webpack dev server
    'webpack-dev-server/client?http://localhost:' + hotRailsPort,
    'webpack/hot/dev-server',
    'expose?Perf!react-addons-perf'
  )
})

config.output = {
  filename: '[name]-bundle.js',
  path: path.join(__dirname, '..', '..', 'tmp', 'webpack'),
  publicPath: `http://localhost:${hotRailsPort}/`
}

// See webpack.common.config for adding modules common to both the webpack dev server and rails
config.plugins.unshift(
  new webpack.HotModuleReplacementPlugin(),
  new webpack.NoErrorsPlugin()
)

config.module.loaders.push(
  {
    test: /\.jsx?$/,
    loader: 'babel-loader',
    exclude: /node_modules/,
    query: {
      plugins: [
        [
          'react-transform',
          {
            transforms: [
              {
                transform: 'react-transform-hmr',
                imports: ['react'],
                locals: ['module']
              }
            ]
          }
        ]
      ]
    }
  }
)

config.devtool = '#eval-source-map'

module.exports = config
