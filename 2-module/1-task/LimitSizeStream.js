const stream = require('stream');
const LimitExceededError = require('./LimitExceededError');

class LimitSizeStream extends stream.Transform {
  constructor(options) {
    super(options);

    this.limit = options.limit || 0;
    this.size = 0;
  }

  _transform(chunk, encoding, callback) {
    if (Buffer.byteLength(chunk) + this.size <= this.limit) {
      this.size += Buffer.byteLength(chunk);
      callback(null, chunk);
    } else {
      callback(new LimitExceededError());
    }

  }
}

module.exports = LimitSizeStream;
