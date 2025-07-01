import { GetUserProfileQueryHandler } from './get-user-profile.handler';
import { GetUserProfileQuery } from '../queries/get-user-profile.query';
import { IUserRepository } from '../../../shared/domain/user/interfaces/user.interface';
import { UserNotFoundError } from '../../../shared/domain/exceptions/user-not-found.error';
import { User } from '../../../shared/domain/user/entities/user.entity';
import { v4 as uuidv4 } from 'uuid';

describe('GetUserProfileQueryHandler', () => {
  let handler: GetUserProfileQueryHandler;
  let mockUserRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockUserRepository = {
      findById: jest.fn(),
      findByUsername: jest.fn(),
      findByPhoneNumber: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };

    handler = new GetUserProfileQueryHandler(mockUserRepository);
  });

  it('should return user profile if user exists', async () => {
    const userId = uuidv4();
    const username = 'profileuser';
    const phoneNumber = '1234567890';
    const hashedPassword = 'somehash';
    const createdAt = new Date();
    const updatedAt = new Date();

    const mockUser = new User(userId, username, phoneNumber, hashedPassword, createdAt, updatedAt);
    mockUserRepository.findById.mockResolvedValue(mockUser);

    const query = new GetUserProfileQuery(userId);
    const result = await handler.execute(query);

    expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    expect(result).toEqual({
      id: userId,
      username: username,
      phoneNumber: phoneNumber,
      createdAt: createdAt,
      updatedAt: updatedAt,
    });
  });

  it('should throw UserNotFoundError if user does not exist', async () => {
    const userId = uuidv4();
    mockUserRepository.findById.mockResolvedValue(null);

    const query = new GetUserProfileQuery(userId);

    await expect(handler.execute(query)).rejects.toThrow(UserNotFoundError);
    await expect(handler.execute(query)).rejects.toThrow(`User with ID ${userId} not found.`);
    expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
  });
});