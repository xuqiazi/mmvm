'use strict';
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const px2viewport = require('postcss-plugin-pxtoviewport');
module.exports = (env, argv) => {
  const devMode = argv.mode !== 'production';
  return {
    entry: [
      'babel-polyfill',
      path.join(__dirname, './src/js/index.js'),
    ],
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'js/bundle.js',
    },
    devServer: {
      port: 8080, // 端口号
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
          },
        },
        {
          test: require.resolve('zepto'),
          loader: 'exports-loader?window.Zepto!script-loader',
        },
        {
          test: /\.scss$/,
          use: [
            devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
            'css-loader',
            {
              loader: require.resolve('postcss-loader'),
              options: {
                ident: 'postcss',
                plugins: () => [
                  px2viewport({
                    viewportWidth: 1125,
                    toViewport: true,
                  }),
                ],
              },
            },
            'sass-loader',
          ],
        },
        {
          test: /\.html$/,
          use: [{
            loader: 'html-loader',
            options: {
              attrs: [ 'img:src', 'img:data-src', 'audio:src' ],
              minimize: true,
            },
          }],
        },
        {
          test: /\.(png|jpg|gif)$/,
          use: [{
            loader: 'file-loader',
            options: {},
          }],
        },
      ],
    },
    plugins: [
      // ...,
      new MiniCssExtractPlugin({
        filename: './css/[name].css',
        chunkFilename: './css/[id].css',
      }),
      new HtmlWebPackPlugin({
        template: './src/index.html',
        filename: './index.html',
        minify: true,

      }),
      new CleanWebpackPlugin([ 'dist' ]),
    ],
  };
};
