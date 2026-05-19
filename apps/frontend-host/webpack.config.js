const createConfig = require('shared-webpack');

module.exports = createConfig({
  name: 'host',
  port: 3000,
  rootDir: __dirname,
  exposes: {
    './userStore': './src/stores/UserStore.ts'
  },
  remotes: {
    appointments: 'appointments@http://localhost:3001/remoteEntry.js',
    medcard: 'medcard@http://localhost:3002/remoteEntry.js'
  }
});
