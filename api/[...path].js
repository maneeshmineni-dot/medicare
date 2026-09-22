const app = require('../backend/src/app');

module.exports = (req, res) => {
  const matchedPath = req.headers['x-matched-path'] || req.headers['x-vercel-matched-path'];
  if (matchedPath && matchedPath !== '/api/[...path]') {
    req.url = matchedPath;
  }
  return app(req, res);
};
