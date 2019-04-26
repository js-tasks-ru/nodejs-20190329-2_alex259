class NotFoundError extends Error {
    constructor() {
      super('Not found.');
  
      this.name = this.constructor.name;
      Error.captureStackTrace(this, this.constructor);
  
      this.status = 404;
    }
  }
  
  module.exports = NotFoundError;
