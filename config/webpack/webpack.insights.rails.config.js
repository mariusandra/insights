// Run like this:
// cd client && npm run build:dev
// Note that Foreman (Procfile.dev) has also been configured to take care of this.

// NOTE: All style sheets handled by the asset pipeline in rails

const webpack = require('webpack')
const config = require('./webpack.insights.base.config')
const devBuild = process.env.NODE_ENV !== 'production'

config.output = Object.assign({
  filename: '[name]-bundle.js',
  path: './app/assets/javascripts/react' + (devBuild ? '-dev' : '')
}, devBuild ? {} : {
  publicPath: '/assets/react/'
})

// See webpack.common.config for adding modules common to both the webpack dev server and rails
config.module.loaders.push(
  { test: /\.jsx?$/, loader: 'babel-loader', exclude: /node_modules/ }
)

module.exports = config

if (devBuild) {
  // console.log('Webpack dev build for Rails') // eslint-disable-line no-console
  module.exports.devtool = '#eval-source-map'
} else {
  config.plugins.push(
    new webpack.optimize.DedupePlugin()
    // , new webpack.optimize.UglifyJsPlugin({
    //   sourceMap: true,
    //   compress: {
    //     warnings: false
    //   }
    // })
  )
  // console.log('Webpack production build for Rails') // eslint-disable-line no-console
}
