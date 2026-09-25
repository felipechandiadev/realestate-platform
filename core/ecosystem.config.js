const fs = require('fs');
const path = require('path');

function loadEnvFile(filePath) {
  const out = {};
  if (!fs.existsSync(filePath)) return out;
  const text = fs.readFileSync(filePath, 'utf8');
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

const parsed = loadEnvFile(path.join(__dirname, '.env'));
const resolvedEnv = { ...parsed };
for (const key of Object.keys(parsed)) {
  if (process.env[key] != null) resolvedEnv[key] = process.env[key];
}
if (resolvedEnv.NODE_ENV == null) resolvedEnv.NODE_ENV = 'production';
if (resolvedEnv.PORT == null) resolvedEnv.PORT = '8000';
if (resolvedEnv.HOST == null) resolvedEnv.HOST = '0.0.0.0';

module.exports = {
  apps: [
    {
      name: 'rlst-core',
      cwd: __dirname,
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      env: resolvedEnv,
    },
  ],
};
