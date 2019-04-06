const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
  constructor(options) {
    super(options);

    this.buf = '';
  }
  
  pushLine(callback, flush) {
    if (this.buf.indexOf(os.EOL) !== -1) {
      let lines = this.buf.split(os.EOL);
      let line = lines.splice(0, 1)[0];
      this.buf = lines.join(os.EOL);

      callback(null, line);
    } else if (flush) {
      callback(null, this.buf);
    } else {
      callback(null);
    }
  }

  _transform(chunk, encoding, callback) {
    this.buf += chunk.toString();
    this.pushLine(callback);    
  }
  
  _flush(callback) {
    this.pushLine(callback, true);
  }
}

module.exports = LineSplitStream;
