const merge = require('webpack-merge')
const common = require('./webpack.common.js')
const Dotenv = require('dotenv-webpack')

module.exports = merge(common, {
  mode: 'development',
  plugins: [
    new Dotenv({
      path: './.env'
    })
  ]
})