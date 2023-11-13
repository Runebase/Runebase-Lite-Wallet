const webpack = require('webpack');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const styleLoaders = [
  MiniCssExtractPlugin.loader,
  {
    loader: require.resolve('css-loader'),
    options: {
      importLoaders: 1,
    },
  },
  'sass-loader',
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
      'scryptsy/browser': 'scryptsy',
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    fallback: {
      "http": require.resolve("stream-http"),
      "https": require.resolve("https-browserify"),
      "zlib": require.resolve("browserify-zlib"),
      "url": require.resolve("url/"),
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify"),
      "assert": require.resolve("assert/"),
      'util': require.resolve('util/'),
      "buffer": require.resolve("buffer/"),
    },
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx|js)$/,
        enforce: 'pre',
        exclude: /node_modules/,
        use: [
          {
            loader: require.resolve('eslint-loader'),
            options: {
              fix: true,
            },
          },
        ],
      },
      {
        test: /\.js$/,
        include: [
          path.resolve(__dirname, 'node_modules/rweb3'),
          path.resolve(__dirname, 'node_modules/@ethereumjs/util'),
          path.resolve(__dirname, 'node_modules/micro-ftch'),
          path.resolve(__dirname, 'node_modules/@noble'),
          // Add other paths to problematic modules here
        ],
        use: [
          {
            loader: require.resolve('babel-loader'),
            options: {
              presets: [
                [
                  '@babel/preset-env',
                  {
                    targets: {
                      chrome: '58',
                    },
                  },
                ],
              ],
              plugins: [
                '@babel/plugin-proposal-optional-chaining',
                '@babel/plugin-syntax-optional-chaining',
                '@babel/plugin-proposal-nullish-coalescing-operator',
              ],
              sourceType: 'unambiguous',
            },
          },
        ],
      },
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
            test: /\.(ts|tsx)$/,
            include: path.resolve(__dirname, './src'),
            loader: require.resolve('ts-loader'),
          },
          {
            exclude: /node_modules/,
            test: /\.s?css$/,
            use: styleLoaders,
          },
          {
            type: 'asset/resource',
            exclude: [/\.js$/, /\.html$/, /\.json$/],
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
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'static', to: './' },
      ],
    }),
  ],
};
