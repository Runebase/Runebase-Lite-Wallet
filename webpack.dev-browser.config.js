// webpack.dev-browser.config.js
// Development config for running the wallet UI in a regular browser tab
// with hot-reload. Chrome extension APIs are shimmed via abstraction.ts.
const webpack = require('webpack');
const path = require('path');
const { mergeWithCustomize, customizeObject } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const baseConfig = require('./webpack.base.config');

// Use customizeObject to REPLACE entry instead of merging it,
// so we only build popup + background (not contentscript/inpage/scryptworker)
const merge = mergeWithCustomize({
  customizeObject: customizeObject({
    entry: 'replace',
  }),
});

module.exports = merge(baseConfig, {
  mode: 'development',
  devtool: 'eval-source-map',

  // Only build popup + background (the wallet UI and its controller logic)
  entry: {
    background: './src/background/index.ts',
    popup: './src/popup/index.tsx',
  },

  output: {
    path: path.join(__dirname, 'dist-browser'),
    filename: '[name].js',
    publicPath: '/',
  },

  devServer: {
    static: {
      directory: path.join(__dirname, 'static'),
      publicPath: '/',
    },
    port: 3030,
    hot: true,
    open: true,
    historyApiFallback: true,
    devMiddleware: {
      writeToDisk: false,
    },
  },

  plugins: [
    // Generate an HTML file that loads background.js then popup.js
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'static', 'popup-dev.html'),
      filename: 'index.html',
      chunks: ['background', 'popup'],
      chunksSortMode: 'manual',
      inject: 'body',
    }),
    // Let code detect browser dev mode
    new webpack.DefinePlugin({
      'process.env.PLATFORM': JSON.stringify('browser'),
    }),
  ],
});
