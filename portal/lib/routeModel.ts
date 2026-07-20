export type RouteNode = { name: string; path: string; children?: RouteNode[] };

let model: { generatedAt?: string; routes: RouteNode[] } = { generatedAt: new Date().toISOString(), routes: [] };
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  model = require('./route-model.json');
} catch (e) {
  // route-model.json might not exist yet; that's fine
}

export default model as { generatedAt?: string; routes: RouteNode[] };
