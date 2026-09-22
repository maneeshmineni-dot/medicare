// Ensure backend node_modules are resolvable when Vercel runs api/index.js
// Vercel serverless functions run from the project root, but backend deps are in backend/node_modules
const path = require('path');

// Add backend/node_modules to the module resolution path
const backendModulesPath = path.join(__dirname, '..', 'backend', 'node_modules');
if (!require.resolve.paths('').includes(backendModulesPath)) {
  require('module').globalPaths.push(backendModulesPath);
}

const app = require('../backend/src/app');

module.exports = (req, res) => {
  // Recover the real path Vercel routed before rewriting to /api/index.js
  const matchedPath = req.headers['x-matched-path'] || req.headers['x-vercel-matched-path'];
  if (matchedPath && !matchedPath.includes('index.js') && !matchedPath.includes('[')) {
    req.url = matchedPath;
  }
  return app(req, res);
};
