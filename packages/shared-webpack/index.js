const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const deps = require('react/package.json');

module.exports = ({ name, port, exposes = {}, remotes = {}, rootDir, mode = 'development' }) => {
  const isProd = mode === 'production';
  return {
    mode,
    entry: path.resolve(rootDir, 'src/index.tsx'),
    output: {
      publicPath: isProd ? 'auto' : `http://localhost:${port}/`,
      path: path.resolve(rootDir, 'dist'),
      clean: true
    },
    resolve: { extensions: ['.ts', '.tsx', '.js', '.jsx'] },
    devServer: {
      port,
      historyApiFallback: true,
      headers: { 'Access-Control-Allow-Origin': '*' }
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
          options: {
            presets: [
              '@babel/preset-env',
              ['@babel/preset-react', { runtime: 'automatic' }],
              '@babel/preset-typescript'
            ],
            plugins: [['@babel/plugin-proposal-decorators', { legacy: true }]]
          }
        },
        { test: /\.css$/, use: ['style-loader', 'css-loader'] }
      ]
    },
    plugins: [
      new ModuleFederationPlugin({
        name,
        filename: 'remoteEntry.js',
        exposes,
        remotes,
        shared: {
          react: { singleton: true, requiredVersion: deps.version },
          'react-dom': { singleton: true, requiredVersion: deps.version },
          mobx: { singleton: true },
          'mobx-react-lite': { singleton: true }
        }
      }),
      new HtmlWebpackPlugin({ template: path.resolve(rootDir, 'public/index.html') })
    ]
  };
};
