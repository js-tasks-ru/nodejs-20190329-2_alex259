class InvalidIdError extends Error {
    constructor() {
      super('Invalid Id.');
  
      this.name = this.constructor.name;
      Error.captureStackTrace(this, this.constructor);
  
      this.status = 400;
    }
  }
  
  module.exports = InvalidIdError;
