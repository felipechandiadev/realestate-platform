#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, '..', 'app');
const outFile = path.join(__dirname, '..', 'lib', 'route-model.json');

function isRouteDir(dir) {
  try {
    const files = fs.readdirSync(dir);
    return files.some(f => /page\.(t|j)sx?$/.test(f) || /layout\.(t|j)sx?$/.test(f));
  } catch (e) {
    return false;
  }
}

function walk(dir, rel = '') {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (e) {
    return [];
  }

  const children = [];
  for (const e of entries) {
    if (e.isDirectory()) {
      const subdir = path.join(dir, e.name);
      const subrel = rel ? `${rel}/${e.name}` : e.name;
      const deeper = walk(subdir, subrel);
      const hasPage = isRouteDir(subdir);
      if (hasPage || deeper.length) {
        children.push({ name: e.name, path: '/' + subrel, children: deeper });
      }
    }
  }
  return children;
}

if (!fs.existsSync(appDir)) {
  console.error('Could not find frontend app directory at', appDir);
  process.exit(1);
}

const topEntries = fs.readdirSync(appDir, { withFileTypes: true })
  .filter(e => e.isDirectory())
  .map(e => {
    const dir = path.join(appDir, e.name);
    const children = walk(dir, e.name);
    return { name: e.name, path: '/' + e.name, children };
  });

const model = { generatedAt: new Date().toISOString(), routes: topEntries };

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(model, null, 2), 'utf8');
console.log('Wrote', outFile);
