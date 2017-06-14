const webpack = require('webpack')
const path = require('path')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

const devBuild = process.env.NODE_ENV !== 'production'
const nodeEnv = devBuild ? 'development' : 'production'

let config = {
  // the project dir
  context: path.join(__dirname, '..'),
  entry: {
    insights: [
      'babel-polyfill',
      'font-awesome/css/font-awesome.css',
      './client/scenes/index.js',
      './client/scenes/explorer/scene.js'
    ]
  },
  output: {
    filename: '[name]-bundle.js',
    path: path.join(__dirname, '..', 'public', 'dist'),
    publicPath: '/dist/'
  },
  resolve: {
    extensions: ['', '.webpack.js', '.web.js', '.js', '.jsx', '.scss', '.css', 'config.js'],
    alias: {
      '~': path.join(process.cwd(), 'client'),
      lib: path.join(process.cwd(), 'client', 'lib')
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
      { test: /\.less$/, loader: devBuild ? 'style!css?importLoaders=1!less' : ExtractTextPlugin.extract('style', 'css!less') },
      { test: /\.png$/, loader: 'url-loader?limit=10000&mimetype=image/png' },
      { test: /\.jpg$/, loader: 'url-loader?limit=10000&mimetype=image/jpeg' },
      { test: /\.gif$/, loader: 'url-loader?limit=10000&mimetype=image/gif' },
      { test: /\.svg$/, loader: 'url-loader?limit=10000&mimetype=image/svg+xml' },
      { test: /\.rb$/, loader: 'kea-rails-loader' },
      { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url-loader?limit=10000&mimetype=application/font-woff' },
      { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'file-loader' }
    ]
  }
}

if (devBuild) {
  Object.keys(config.entry).filter(k => k !== 'vendor').forEach(k => {
    config.entry[k].unshift(
      // Webpack dev server
      // 'webpack-dev-server/client', // ?http://localhost:' + hotPort,
      'webpack/hot/dev-server',
      'webpack-hot-middleware/client',
      'expose?Perf!react-addons-perf'
    )
  })

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
} else {
  // See webpack.common.config for adding modules common to both the webpack dev server and rails
  config.module.loaders.push({ test: /\.jsx?$/, loader: 'babel-loader', exclude: /node_modules/ })
  module.exports = config

  config.plugins.push(
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      compress: {
        warnings: false
      }
    })
  )
}

module.exports = config
