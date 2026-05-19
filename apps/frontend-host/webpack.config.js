const createConfig = require('shared-webpack');

module.exports = (env, argv) => {
  const mode = argv.mode || 'development';
  const isProd = mode === 'production';
  return createConfig({
    name: 'host',
    port: 3000,
    rootDir: __dirname,
    mode,
    exposes: {
      './userStore': './src/stores/UserStore.ts'
    },
    remotes: {
      appointments: isProd
        ? 'appointments@/appointments/remoteEntry.js'
        : 'appointments@http://localhost:3001/remoteEntry.js',
      medcard: isProd
        ? 'medcard@/medcard/remoteEntry.js'
        : 'medcard@http://localhost:3002/remoteEntry.js'
    }
  });
};
