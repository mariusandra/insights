/* eslint no-var: 0, no-console: 0 */

var webpack = require('webpack')
var WebpackDevServer = require('webpack-dev-server')

var webpackConfig = require('./webpack.insights.rails.hot.config')

const hotRailsPort = process.env.HOT_RAILS_PORT || 3350

const compiler = webpack(webpackConfig)

const devServer = new WebpackDevServer(compiler, {
  // contentBase: 'http://localhost:' + hotRailsPort,
  publicPath: webpackConfig.output.publicPath,
  hot: true,
  inline: true,
  historyApiFallback: true,
  quiet: false,
  noInfo: false,
  lazy: false,
  stats: {
    colors: true,
    hash: false,
    version: false,
    chunks: true,
    children: true
  }
})

devServer.listen(hotRailsPort, '0.0.0.0', function (err) {
  if (err) console.error(err)
  console.log(
    '=> 🔥  Webpack development server is running on port ' + hotRailsPort
  )
})
