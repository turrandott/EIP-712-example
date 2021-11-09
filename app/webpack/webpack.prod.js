require('dotenv').config()
const webpack = require('webpack')
const merge = require('webpack-merge')
const common = require('./webpack.common.js')

const envObj = {
    'process.env.PORT': JSON.stringify(process.env.PORT),
}

module.exports = merge(common, {
  mode: 'production',
  plugins: [
    new webpack.DefinePlugin(envObj)
  ]
})
