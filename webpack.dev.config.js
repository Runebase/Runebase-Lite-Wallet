const { merge } = require('webpack-merge'); // Destructure the merge function
const baseConfig = require('./webpack.base.config');

module.exports = merge(baseConfig, {
  mode: 'development',
  devServer: {
    contentBase: './dist',
  },
});
