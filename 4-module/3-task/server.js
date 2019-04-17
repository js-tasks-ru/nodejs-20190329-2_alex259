const url = require('url');//repeat PR after fix for tests
const http = require('http');
const path = require('path');
const fs = require('fs');

const server = new http.Server();

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'DELETE':
      if (!pathname) {
        res.statusCode = 404;
        res.end('Specify filename');

      } else if (path.dirname(filepath) !== path.join(__dirname, 'files')) {
        res.statusCode = 400;
        res.end('Directories are not supported');

      } else {

        fs.unlink(filepath, (err) => {

          if (err) {
            if (err.code === "ENOENT") {
              res.statusCode = 404;
              res.end('No such file');
            } else {
              res.statusCode = 500;
              res.end('Error');
            }
          }

          res.statusCode = 200;
          res.end();
        });
      }

      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
