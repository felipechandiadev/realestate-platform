#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const modelFile = path.join(__dirname, '..', 'lib', 'route-model.json');
const outBase = path.join(__dirname, '..', 'tests', 'generated');

if (!fs.existsSync(modelFile)) {
  console.error('Route model not found. Run build-route-model.js first');
  process.exit(1);
}

const model = JSON.parse(fs.readFileSync(modelFile, 'utf8'));

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }

function sanitizeName(name) {
  return name.replace(/[^a-z0-9-_]/gi, '_');
}

function createTestForRoute(sectionName, route) {
  const routePath = route.path.replace(/^\//, '');
  const fileDir = path.join(outBase, sectionName, routePath);
  ensureDir(fileDir);
  const fileName = sanitizeName(route.name || 'index') + '.test.ts';
  const filePath = path.join(fileDir, fileName);
  const content = `import { describe, it, expect } from '@jest/globals';

describe('${sectionName} - ${route.path}', () => {
  it('renders ${route.path} (placeholder)', () => {
    expect(true).toBe(true);
  });
});
`;
  fs.writeFileSync(filePath, content, 'utf8');
  if (route.children && route.children.length) {
    route.children.forEach(child => createTestForRoute(sectionName, child));
  }
}

ensureDir(outBase);
model.routes.forEach(section => {
  const secName = section.name;
  createTestForRoute(secName, section);
});

console.log('Generated tests in', outBase);
