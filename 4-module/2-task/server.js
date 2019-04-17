const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');

const LimitSizeStream = require('./LimitSizeStream');

const server = new http.Server();

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);
  let fileStream;

  switch (req.method) {
    case 'POST':
      if (!pathname) {
        res.statusCode = 404;
        res.end('Specify filename');

      } else if (path.dirname(filepath) !== path.join(__dirname, 'files')) {
        res.statusCode = 400;
        res.end('Directories are not supported');

      } else {

        fileStream = fs.createWriteStream(filepath, {"flags": "wx"});
        fileStream.write("");

        let limitSizeStream = new LimitSizeStream({limit: 1048576})
        
        req.on('aborted', (err) => {
          fileStream.destroy();
          fs.unlinkSync(filepath, () => { 
          });
        })
        .pipe(limitSizeStream)
        .on("error", (err) => {
          if (err.code === 'LIMIT_EXCEEDED') {
            fileStream.destroy();
            fs.unlink(filepath, () => { 
              res.statusCode = 413;
              res.end('File is too big');
              });            
          } else {
            fileStream.destroy();
            fs.unlink(filepath, () => { 
              res.statusCode = 500;
              res.end('Error');
            });
          }
        })
        .pipe(fileStream)          
        .on("error", (err) => {
          if (err.code === "EEXIST") {
            res.statusCode = 409;
            res.end('File exists');
          } else {
            res.statusCode = 500;
            res.end('Oops! something went wrong: ' + err.code);
          }
        })
        .on("finish", () => {
          res.statusCode = 201;
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
