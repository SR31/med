const createConfig = require('shared-webpack');

module.exports = createConfig({
  name: 'medcard',
  port: 3002,
  rootDir: __dirname,
  exposes: {
    './App': './src/App.tsx',
    './store': './src/store.ts'
  },
  remotes: {
    host: 'host@http://localhost:3000/remoteEntry.js'
  }
});
