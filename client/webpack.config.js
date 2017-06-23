const webpack = require('webpack')
const path = require('path')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

const devBuild = process.env.NODE_ENV !== 'production'
const nodeEnv = devBuild ? 'development' : 'production'

let postcssPlugins = (webpack) => [
  require('postcss-smart-import')({ addDependencyTo: webpack }),
  require('autoprefixer'),
  require('precss')
]

let postcssLoader = {
  loader: 'postcss-loader',
  options: { parser: 'postcss-scss', ident: 'postcss', plugins: postcssPlugins }
}

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
    extensions: ['.webpack.js', '.web.js', '.js', '.jsx', '.scss', '.css', 'config.js'],
    alias: {
      '~': path.join(process.cwd(), 'client'),
      lib: path.join(process.cwd(), 'client', 'lib')
    }
  },
  plugins: [
    new webpack.optimize.ModuleConcatenationPlugin(),
    new ExtractTextPlugin('[name].css'),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(nodeEnv)
      }
    }),
    new webpack.ProvidePlugin({
      'fetch': 'imports-loader?this=>global!exports-loader?global.fetch!whatwg-fetch'
    }),
    new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /en-gb/)
  ],
  module: {
    rules: [
      {
        test: /\.s?css$/,
        loader: devBuild
          ? [
            'style-loader',
            'css-loader?importLoaders=1',
            postcssLoader
          ] : ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [
              'css-loader',
              postcssLoader
            ]
          })
      },
      { test: /\.png$/, loader: 'url-loader?limit=10000&mimetype=image/png' },
      { test: /\.jpg$/, loader: 'url-loader?limit=10000&mimetype=image/jpeg' },
      { test: /\.gif$/, loader: 'url-loader?limit=10000&mimetype=image/gif' },
      { test: /\.svg$/, loader: 'url-loader?limit=10000&mimetype=image/svg+xml' },
      { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url-loader?limit=10000&mimetype=application/font-woff' },
      { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'file-loader' }
    ]
  }
}

if (process.env.ANALYZE_BUNDLE) {
  var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
  config.plugins.push(new BundleAnalyzerPlugin())
}

if (devBuild) {
  Object.keys(config.entry).filter(k => k !== 'vendor').forEach(k => {
    config.entry[k].unshift(
      // Webpack dev server
      // 'webpack-dev-server/client', // ?http://localhost:' + hotPort,
      'webpack/hot/dev-server',
      'webpack-hot-middleware/client',
      'expose-loader?Perf!react-addons-perf'
    )
  })

  // See webpack.common.config for adding modules common to both the webpack dev server and rails
  config.plugins.unshift(
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  )

  config.module.rules.push(
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

  config.devtool = '#cheap-module-source-map'
} else {
  // See webpack.common.config for adding modules common to both the webpack dev server and rails
  config.module.rules.push({ test: /\.jsx?$/, loader: 'babel-loader', exclude: /node_modules/ })
  module.exports = config

  config.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      compress: {
        warnings: false
      }
    })
  )
}

module.exports = config
