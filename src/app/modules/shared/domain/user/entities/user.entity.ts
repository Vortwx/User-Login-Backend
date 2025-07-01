export class User {
  private _id: string;
  private _username: string;
  private _phoneNumber: string;
  private _hashedPassword: string;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(
    id: string,
    username: string,
    phoneNumber: string,
    hashedPassword: string,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
  ) {
    if (!username || username.trim() === '') {
      throw new Error('Username must exists.');
    }
    
    // Phone number should be at least 10 digits
    if (!phoneNumber || !/^\d{10,}$/.test(phoneNumber)) {
      throw new Error('Invalid phone number format.');
    }
    if (!hashedPassword) {
      throw new Error('Password cannot be empty.');
    }

    this._id = id;
    this._username = username;
    this._phoneNumber = phoneNumber;
    this._hashedPassword = hashedPassword;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  get id(): string { return this._id; }
  get username(): string { return this._username; }
  get phoneNumber(): string { return this._phoneNumber; }
  get hashedPassword(): string { return this._hashedPassword; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  public updatePhoneNumber(newPhoneNumber: string): void {
    if (!newPhoneNumber || !/^\d{10,}$/.test(newPhoneNumber)) {
      throw new Error('Invalid new phone number format.');
    }
    this._phoneNumber = newPhoneNumber;
    this._updatedAt = new Date();
  }

  public updateHashedPassword(newHashedPassword: string): void {
    if (!newHashedPassword) {
      throw new Error('New password cannot be empty.');
    }
    // tricky check (Need to do bug checking)
    else if (newHashedPassword === this._hashedPassword) {
      throw new Error('New password cannot be the same as the old one.');
    }
    this._hashedPassword = newHashedPassword;
    this._updatedAt = new Date();
  }

}