// tslint:disable:no-implicit-dependencies
import webpack from 'webpack';
import slsw from 'serverless-webpack';
import path from 'path';
import nodeExternals from 'webpack-node-externals';
import { isProd } from '@hollowverse/utils/helpers/env';
import UglifyJsPlugin from 'uglifyjs-webpack-plugin';

module.exports = {
  mode: isProd ? 'production' : 'development',
  entry: slsw.lib.entries,
  target: 'node',
  devtool: 'source-map',
  output: {
    libraryTarget: 'commonjs',
    path: path.resolve(__dirname, '.webpack'),
    filename: '[name].js',
  },
  stats: 'minimal',
  module: {
    rules: [
      {
        test: /\.ts$/i,
        use: [
          {
            loader: 'babel-loader',
          },
          {
            loader: 'ts-loader',
          },
        ],
      },
    ],
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        uglifyOptions: {
          keep_classnames: true,
          compress: {
            inline: false,
          },
        },
      }),
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  plugins: [new webpack.WatchIgnorePlugin([/node_modules/])],
  externals: [nodeExternals()],
};
