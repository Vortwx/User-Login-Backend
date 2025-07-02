import { CreateUserCommandHandler } from './create-user.handler';
import { CreateUserCommand } from '../commands/create-user.command';
import { IUserRepository } from '../../../shared/domain/user/interfaces/user.interface';
import { IHasherService } from '../../domain/interfaces/hasher-service.interface';
import { User } from '../../../shared/domain/user/entities/user.entity';
import { DuplicateUserError } from '../../domain/exceptions/duplicate-user.error';
import { v4 as uuidv4 } from 'uuid';

describe('CreateUserCommandHandler', () => {
    let handler: CreateUserCommandHandler;
    let mockUserRepository: jest.Mocked<IUserRepository>;
    let mockHasherService: jest.Mocked<IHasherService>;

    // Initialisation
    beforeEach(() => {
        mockUserRepository = {
            findByUsername: jest.fn(),
            findById: jest.fn(),
            findByPhoneNumber: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
        };
        mockHasherService = {
            hash: jest.fn(),
            compare: jest.fn(),
        };

        handler = new CreateUserCommandHandler(
            mockUserRepository,
            mockHasherService,
        );
    });

    /**
     * This scenario is a success path.
     * User does not exist and phone number not yet created in database
     * Save operation doesnt't return any value
     */
    it('should successfully create a new user', async () => {
        const username = 'newuser';
        const password = 'Password123!';
        const phoneNumber = '1234567890';
        const hashedPassword = 'hashedpassword';

        mockUserRepository.findByUsername.mockResolvedValue(null);
        mockUserRepository.findByPhoneNumber.mockResolvedValue(null);
        mockHasherService.hash.mockResolvedValue(hashedPassword);
        mockUserRepository.save.mockResolvedValue(undefined);

        const command = new CreateUserCommand(username, password, phoneNumber);
        const result = await handler.execute(command);

        expect(mockUserRepository.findByUsername).toHaveBeenCalledWith(
            username,
        );
        expect(mockUserRepository.findByPhoneNumber).toHaveBeenCalledWith(
            phoneNumber,
        );
        expect(mockHasherService.hash).toHaveBeenCalledWith(password);
        expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
        // First argument of the first call to the save method should be an instance of User
        expect(mockUserRepository.save.mock.calls[0][0]).toBeInstanceOf(User);
        expect(mockUserRepository.save.mock.calls[0][0].username).toBe(
            username,
        );
        expect(mockUserRepository.save.mock.calls[0][0].phoneNumber).toBe(
            phoneNumber,
        );
        expect(mockUserRepository.save.mock.calls[0][0].hashedPassword).toBe(
            hashedPassword,
        );

        expect(result).toHaveProperty('id');
        expect(result.username).toBe(username);
        expect(result.phoneNumber).toBe(phoneNumber);
    });

    /**
     * This scenario contains duplicate username but not phone number
     * It should throw DuplicateUserError and will not proceed with hashing and save
     */

    it('should throw DuplicateUserError if username already exists', async () => {
        const username = 'existinguser';
        const password = 'Password123!';
        const phoneNumber = '1234567890';
        const existingUser = new User(
            uuidv4(),
            username,
            '0987654321',
            'somehash',
        );

        mockUserRepository.findByUsername.mockResolvedValue(existingUser);
        mockUserRepository.findByPhoneNumber.mockResolvedValue(null);

        const command = new CreateUserCommand(username, password, phoneNumber);

        await expect(handler.execute(command)).rejects.toThrow(
            DuplicateUserError,
        );
        await expect(handler.execute(command)).rejects.toThrow(
            'Username already exists.',
        );
        expect(mockHasherService.hash).not.toHaveBeenCalled();
        expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    /**
     * This scenario contains duplicate phone number but not username
     * It should throw DuplicateUserError and will not proceed with hashing and save
     */

    it('should throw DuplicateUserError if phone number already createed', async () => {
        const username = 'newuser2';
        const password = 'Password123!';
        const phoneNumber = '1234567890';
        const existingUser = new User(
            uuidv4(),
            'otheruser',
            phoneNumber,
            'somehash',
        );

        mockUserRepository.findByUsername.mockResolvedValue(null);
        mockUserRepository.findByPhoneNumber.mockResolvedValue(existingUser);

        const command = new CreateUserCommand(username, password, phoneNumber);

        await expect(handler.execute(command)).rejects.toThrow(
            DuplicateUserError,
        );
        await expect(handler.execute(command)).rejects.toThrow(
            'Phone number already registered.',
        );
        expect(mockHasherService.hash).not.toHaveBeenCalled();
        expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should throw an error if username is empty (DTO validation)', async () => {
        const command = new CreateUserCommand('', 'Password123!', '1234567890');
        await expect(handler.execute(command)).rejects.toThrow(
            'Username cannot be empty.',
        );
    });

    it('should throw an error if phone number is invalid (DTO validation)', async () => {
        const command = new CreateUserCommand(
            'testuser',
            'Password123!',
            '123',
        );
        await expect(handler.execute(command)).rejects.toThrow(
            'Invalid phone number format. Must be at least 10 digits.',
        );
    });
});
