const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
  constructor(options) {
    super(options);

    this.remainder = '';
  }
  
  _transform(chunk, encoding, callback) {
    let str = this.remainder + chunk.toString();    
    let lines = str.split(os.EOL);
    this.remainder = lines.pop();

    for(let line of lines) {
      this.push(line);
    }

    callback();
  }
  
  _flush(callback) {
    callback(null, this.remainder);
  }
}

module.exports = LineSplitStream;
