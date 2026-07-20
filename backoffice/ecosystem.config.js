const path = require('path');
const { config } = require('dotenv');

const envPath = path.join(__dirname, '.env');
const { parsed = {}, error } = config({ path: envPath });

if (error) {
  throw error;
}

const resolvedEnv = Object.keys(parsed).reduce((acc, key) => {
  acc[key] = process.env[key] ?? parsed[key];
  return acc;
}, {});

if (resolvedEnv.NODE_ENV == null) {
  resolvedEnv.NODE_ENV = 'production';
}

if (resolvedEnv.PORT == null) {
  resolvedEnv.PORT = '3001';
}

module.exports = {
  apps: [
    {
      name: 'realestate-frontend',
      cwd: __dirname,
      script: 'server.js',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      ignore_watch: ['node_modules', '.next'],
      env: resolvedEnv
    }
  ]
};
