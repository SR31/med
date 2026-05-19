const createConfig = require('shared-webpack');

module.exports = createConfig({
  name: 'appointments',
  port: 3001,
  rootDir: __dirname,
  exposes: {
    './App': './src/App.tsx',
    './store': './src/store.ts'
  },
  remotes: {
    host: 'host@http://localhost:3000/remoteEntry.js'
  }
});
