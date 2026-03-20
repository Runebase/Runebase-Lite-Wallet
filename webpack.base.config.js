// webpack.base.config.js
const webpack = require('webpack');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

const styleLoaders = [
  MiniCssExtractPlugin.loader,
  {
    loader: require.resolve('css-loader'),
    options: {
      importLoaders: 1,
    },
  },
  {
    loader: 'sass-loader',
    options: {
      api: 'modern',
    },
  },
];

module.exports = {
  entry: {
    background: './src/background/index.ts',
    contentscript: './src/contentscript/index.ts',
    inpage: './src/inpage/index.ts',
    popup: './src/popup/index.tsx',
    scryptworker: './src/background/workers/scryptworker.js',
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: 'chrome-extension://__MSG_@@extension_id__/',
  },
  resolve: {
    alias: {
      'process/browser': require.resolve('process/browser.js'),
      'scryptsy/browser': 'scryptsy',
      'clsx': require.resolve('clsx'),
      'bignumber.js': path.resolve(__dirname, 'node_modules/bignumber.js/dist/bignumber.mjs'),
      // Fix @floating-ui ESM/CJS interop warnings from @mui/base
      '@floating-ui/react-dom': path.resolve(__dirname, 'node_modules/@floating-ui/react-dom/dist/floating-ui.react-dom.esm.js'),
      '@floating-ui/dom': path.resolve(__dirname, 'node_modules/@floating-ui/dom/dist/floating-ui.dom.esm.js'),
      '@floating-ui/core': path.resolve(__dirname, 'node_modules/@floating-ui/core/dist/floating-ui.core.esm.js'),
      '@floating-ui/utils/dom': path.resolve(__dirname, 'node_modules/@floating-ui/utils/dom/dist/floating-ui.utils.dom.esm.js'),
      '@floating-ui/utils': path.resolve(__dirname, 'node_modules/@floating-ui/utils/dist/floating-ui.utils.esm.js'),
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    fallback: {
      'http': require.resolve('stream-http'),
      'https': require.resolve('https-browserify'),
      'zlib': require.resolve('browserify-zlib'),
      'url': require.resolve('url/'),
      'crypto': require.resolve('crypto-browserify'),
      'stream': require.resolve('stream-browserify'),
      'assert': require.resolve('assert/'),
      'util': require.resolve('util/'),
      'buffer': require.resolve('buffer/'),
      'events': require.resolve('events/'),
      'vm': require.resolve('vm-browserify'),
    },
  },
  module: {
    rules: [
      {
        oneOf: [
          {
            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
            type: 'asset/resource',
            generator: {
              filename: 'static/[name].[hash:8][ext]',
            },
          },
          {
            test: /\.(ts|tsx|js)$/,
            include: [
              path.resolve(__dirname, 'node_modules/rweb3'),
              path.resolve(__dirname, 'node_modules/@ethereumjs/util'),
              path.resolve(__dirname, 'node_modules/micro-ftch'),
              path.resolve(__dirname, 'node_modules/@noble'),
              path.resolve(__dirname, './src'),
              // path.resolve(__dirname, 'node_modules/runebasejs-wallet'),
              // Add other paths to problematic modules here
            ],
            use: [
              {
                loader: require.resolve('babel-loader'),
              },
            ],
          },
          {
            exclude: /node_modules/,
            test: /\.s?css$/,
            use: styleLoaders,
          },
          {
            type: 'asset/resource',
            exclude: [/\.m?[jc]?js$/, /\.html$/, /\.json$/],
            generator: {
              filename: 'static/[name].[hash:8][ext]',
            },
          },
        ],
      },
    ],
  },
  // optimization: {
  //   minimize: true,
  //   minimizer: [
  //     // new CssMinimizerPlugin(),
  //   ],
  // },
  plugins: [
    new ESLintPlugin({
      overrideConfigFile: path.resolve(__dirname, 'eslint.config.mjs'),
      fix: true,
      files: 'src/**/*.ts',
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer']
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'static', to: './' },
      ],
    }),
    new webpack.DefinePlugin({
      'process.env.APP_VERSION': JSON.stringify(require('./package.json').version),
    }),
  ],
};
