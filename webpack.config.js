const nodeExternals = require('webpack-node-externals')
const path = require('path')

module.exports = {
  entry: {
    index: './index.js',
    files: './files.js',
    operators: './operators.js',
    status: './status.js',
  },
  target: 'node',
  devtool: 'source-map',
  externals: [nodeExternals()],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    library: {
      name: 'JITDB',
      type: 'umd',
    },
  },
}
