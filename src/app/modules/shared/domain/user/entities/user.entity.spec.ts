import { User } from './user.entity';

describe('User Entity', () => {
  const mockId = '11111111-2222-4333-a444-555566667777'; // Using a fixed UUIDv4 for testing
  const mockUsername = 'testuser';
  const mockPhoneNumber = '1234567890';
  const mockHashedPassword = 'hashedpassword'; // This is not the correct format for bcrypt hash, but this doesn't affect the domain invariant test
  const mockCreatedAt = new Date();
  const mockUpdatedAt = new Date();

  it('should create a User instance successfully with valid data', () => {
    const user = new User(
      mockId,
      mockUsername,
      mockPhoneNumber,
      mockHashedPassword,
      mockCreatedAt,
      mockUpdatedAt,
    );

    expect(user.id).toBe(mockId);
    expect(user.username).toBe(mockUsername);
    expect(user.phoneNumber).toBe(mockPhoneNumber);
    expect(user.hashedPassword).toBe(mockHashedPassword);
    expect(user.createdAt).toBe(mockCreatedAt);
    expect(user.updatedAt).toBe(mockUpdatedAt);
  });

  // test domain invariant
  it('should throw an error if username is empty', () => {
    expect(() => new User(mockId, '', mockPhoneNumber, mockHashedPassword))
      .toThrow('Username must exists.');
    expect(() => new User(mockId, '   ', mockPhoneNumber, mockHashedPassword))
      .toThrow('Username must exists.');
  });


  it('should throw an error if phone number is invalid (too short)', () => {
    expect(() => new User(mockId, mockUsername, '123', mockHashedPassword))
      .toThrow('Invalid phone number format. Must be at least 10 digits.');
  });

  it('should throw an error if phone number contains non-digits', () => {
    expect(() => new User(mockId, mockUsername, '123-456-7890', mockHashedPassword))
      .toThrow('Invalid phone number format. Must be at least 10 digits.');
  });

  it('should throw an error if hashed password is empty', () => {
    expect(() => new User(mockId, mockUsername, mockPhoneNumber, ''))
      .toThrow('Password cannot be empty.');
  });

  it('should update phone number that adheres to domain invariant correctly', () => {
    const user = new User(mockId, mockUsername, mockPhoneNumber, mockHashedPassword);
    const newPhoneNumber = '9876543210';

    user.updatePhoneNumber(newPhoneNumber);

    expect(user.phoneNumber).toBe(newPhoneNumber);
  });

  it('should throw an error when updating with an invalid phone number', () => {
    const user = new User(mockId, mockUsername, mockPhoneNumber, mockHashedPassword);
    expect(() => user.updatePhoneNumber('invalid'))
      .toThrow('Invalid new phone number format. Must be at least 10 digits.');
  });

  it('should update hashed password correctly', () => {
    const user = new User(mockId, mockUsername, mockPhoneNumber, mockHashedPassword);
    const newHashedPassword = 'newhashedpassword';

    user.updateHashedPassword(newHashedPassword);

    expect(user.hashedPassword).toBe(newHashedPassword);
  });

  // Practically would be impossible to happen as the process is handled by bcrypt
  // Written just in case
  it('should throw an error when updating with an empty hashed password', () => {
    const user = new User(mockId, mockUsername, mockPhoneNumber, mockHashedPassword);
    expect(() => user.updateHashedPassword(''))
      .toThrow('New password cannot be empty.');
  });
});