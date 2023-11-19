// webpack.prod.config.js
const { merge } = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');
const baseConfig = require('./webpack.base.config');

module.exports = merge(baseConfig, {
  mode: 'production',
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          mangle: {
            safari10: true,
            keep_fnames: true,
          },
          compress: {
            drop_console: true, // Exclude console logs in production
          },
        },
        extractComments: false,
      }),
    ],
    concatenateModules: false,
  },
});
