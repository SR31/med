const createConfig = require('shared-webpack');

module.exports = (env, argv) => {
  const mode = argv.mode || 'development';
  return createConfig({
    name: 'appointments',
    port: 3001,
    rootDir: __dirname,
    mode,
    exposes: {
      './App': './src/App.tsx',
      './store': './src/store.ts'
    },
    remotes: {
      host:
        mode === 'production'
          ? 'host@/remoteEntry.js'
          : 'host@http://localhost:3000/remoteEntry.js'
    }
  });
};
