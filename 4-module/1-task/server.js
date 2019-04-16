const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');
//const mime = require('mime');

const server = new http.Server();

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);
  let fileStream;

  switch (req.method) {
    case 'GET':
      if (!pathname) {
        res.statusCode = 404;
        res.end('Specify filename');

      } else if (path.dirname(filepath) !== path.join(__dirname, 'files')) {
        res.statusCode = 400;
        res.end('Directories are not supported');

      } else {
        fs.access(filepath, fs.constants.F_OK, (err) => {
          if (err) {
            res.statusCode = 404;
            res.end('No such file');

          } else {

            //res.setHeader("Content-type", mime.getType(filepath));

            fileStream = fs.createReadStream(filepath);
            fileStream.on("error", (err) => {
              res.statusCode = 500;
              res.end('Oops! something went wront');
            });
            res.on("close", (err) => {
              fileStream.destroy();
            });

            res.statusCode = 200;
            fileStream.pipe(res);
          }
        });
      }

      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
