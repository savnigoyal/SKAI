const app = require('../server');

// Vercel rewrites /inventory/api/* here; strip the prefix so Express sees /api/*.
module.exports = (req, res) => {
  req.url = req.url.replace(/^\/inventory(?=\/api\/)/, '');
  return app(req, res);
};
