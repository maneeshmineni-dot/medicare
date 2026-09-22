const path = require('path');
const backendModulesPath = path.join(__dirname, '..', 'backend', 'node_modules');
if (!require.resolve.paths('').includes(backendModulesPath)) {
  require('module').globalPaths.push(backendModulesPath);
}

const app = require('../backend/src/app');

module.exports = (req, res) => {
  const matchedPath = req.headers['x-matched-path'] || req.headers['x-vercel-matched-path'];
  if (matchedPath && !matchedPath.includes('[')) {
    req.url = matchedPath;
  }
  return app(req, res);
};
