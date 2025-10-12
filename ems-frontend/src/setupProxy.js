const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost/EMS/ems-backend-php',
      changeOrigin: true,
      secure: false,
      xfwd: true,
      onProxyReq: (proxyReq, req) => {
        const auth = req.headers['authorization'];
        if (auth) proxyReq.setHeader('authorization', auth);
      },
    })
  );
};
