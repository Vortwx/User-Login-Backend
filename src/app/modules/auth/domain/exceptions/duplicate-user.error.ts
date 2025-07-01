export class DuplicateUserError extends Error {
    constructor(message: string = 'User with given username or phone number already exists.') {
      super(message);
      this.name = 'DuplicateUserError';
    }
  }