// tslint:disable:no-implicit-dependencies
/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
import { isProd } from '@hollowverse/utils/helpers/env';
// @ts-ignore
import CopyWebpackPlugin from 'copy-webpack-plugin';
import path from 'path';
// @ts-ignore
import slsw from 'serverless-webpack';
import UglifyJsPlugin from 'uglifyjs-webpack-plugin';
import webpack from 'webpack';
import nodeExternals from 'webpack-node-externals';

module.exports = {
  mode: isProd ? 'production' : 'development',
  entry: slsw.lib.entries,
  target: 'node',
  devtool: 'source-map',
  node: {
    __dirname: true,
  },
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
  plugins: [
    // @ts-ignore
    new CopyWebpackPlugin([
      {
        from: 'src/schema.graphql',
        to: './src',
      },
    ]),
    new webpack.WatchIgnorePlugin([/node_modules/]),
  ],
  externals: [nodeExternals()],
};
