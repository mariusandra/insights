import path from 'path'

const root = process.env.INSIGHTS_WEB_PUBLIC || path.join(__dirname, '..', '..', 'insights-web', 'build')
const port = process.env.INSIGHTS_WEB_PORT || 8080

const handler = require('serve-handler');
const http = require('http');

const server = http.createServer((request, response) => {
  // You pass two more arguments for config and middleware
  // More details here: https://github.com/zeit/serve-handler#options

  return handler(request, response, {
    "public": root,
    rewrites: [{
      source: '**',
      destination: '/index.html'
    }]
  });
});

server.listen(port, () => {
  console.log(`Running at: http://localhost:${port}`);
  console.log(`Serving from: ${root}`);
});
