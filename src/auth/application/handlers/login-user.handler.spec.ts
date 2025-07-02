import { LoginUserCommandHandler } from './login-user.handler';
import { LoginUserCommand } from '../commands/login-user.command';
import { IUserRepository } from '../../../shared/domain/user/interfaces/user.interface';
import { IHasherService } from '../../domain/interfaces/hasher-service.interface';
import { IJwtService } from '../../domain/interfaces/jwt-service.interface';
import { IDynamicCodeService } from '../../domain/interfaces/dynamic-code-service.interface';
import { User } from '../../../shared/domain/user/entities/user.entity';
import { InvalidCredentialsError } from '../../domain/exceptions/invalid-credentials.error';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';

describe('LoginUserCommandHandler', () => {
    let handler: LoginUserCommandHandler;
    let mockUserRepository: jest.Mocked<IUserRepository>;
    let mockHasherService: jest.Mocked<IHasherService>;
    let mockJwtService: jest.Mocked<IJwtService>;
    let mockDynamicCodeService: jest.Mocked<IDynamicCodeService>;
    let configService: ConfigService;

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
        mockJwtService = {
            sign: jest.fn(),
            verify: jest.fn(),
        };
        mockDynamicCodeService = {
            generateDynamicCode: jest.fn(),
            storeDynamicCode: jest.fn(),
            verifyDynamicCode: jest.fn(),
        };

        configService = new ConfigService();

        handler = new LoginUserCommandHandler(
            mockUserRepository,
            mockHasherService,
            mockJwtService,
            mockDynamicCodeService,
            configService
        );
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    /**
     * This scenario is a success path.
     * User exists and password is correct
     * Ensure the following processes are followed:
     * 1. Find user by username
     * 2. Compare password with hashed password
     * 3. Generate dynamic code
     * 4. Hash dynamic code
     * 5. Store dynamic code
     * 6. Sign JWT
     * 7. Return preAuthToken
     *
     */
    it('should successfully login and return a preAuthToken', async () => {
        const userId = uuidv4();
        const username = 'testuser';
        const password = 'Password123!';
        const hashedPassword = 'hashedPassword';
        const dynamicCode = '123456';
        const hashedDynamicCode = 'hashedDynamicCode';
        const preAuthToken = 'mockPreAuthToken';

        const mockUser = new User(
            userId,
            username,
            '1234567890',
            hashedPassword,
        );

        mockUserRepository.findByUsername.mockResolvedValue(mockUser);
        mockHasherService.compare.mockResolvedValue(true);
        mockDynamicCodeService.generateDynamicCode.mockReturnValue(dynamicCode);
        mockHasherService.hash.mockResolvedValue(hashedDynamicCode);
        mockDynamicCodeService.storeDynamicCode.mockReturnValue(undefined);
        mockJwtService.sign.mockResolvedValue(preAuthToken);

        const command = new LoginUserCommand(username, password);
        const result = await handler.execute(command);

        expect(mockUserRepository.findByUsername).toHaveBeenCalledWith(
            username,
        );
        expect(mockHasherService.compare).toHaveBeenCalledWith(
            password,
            hashedPassword,
        );
        expect(mockDynamicCodeService.generateDynamicCode).toHaveBeenCalled();
        expect(mockHasherService.hash).toHaveBeenCalledWith(dynamicCode);
        expect(mockDynamicCodeService.storeDynamicCode).toHaveBeenCalledWith(
            userId,
            hashedDynamicCode
        );
        expect(mockJwtService.sign).toHaveBeenCalledWith(
            {
                sub: userId,
                purpose: 'dynamic_code_verification'
            },
            {
                expiresIn: "5m", // .env call will have issue with this hence is set to fixed variable for now
                secret: process.env.JWT_TEMP_SECRET || undefined
            }
        );

        expect(result).toEqual({
            message:
                'Dynamic code required. Check your registered phone number.',
            preAuthToken: preAuthToken,
        });
    });

    /**
     * In this case the given username is not found in database
     * Make sure respective handler throw InvalidCredentialsError
     * Further process will not be proceeded
     */

    it('should throw InvalidCredentialsError if user not found', async () => {
        mockUserRepository.findByUsername.mockResolvedValue(null);

        const command = new LoginUserCommand('nonexistent', 'password');

        await expect(handler.execute(command)).rejects.toThrow(
            InvalidCredentialsError,
        );
        await expect(handler.execute(command)).rejects.toThrow(
            'Invalid username.',
        );
        expect(mockHasherService.compare).not.toHaveBeenCalled();
        expect(
            mockDynamicCodeService.generateDynamicCode,
        ).not.toHaveBeenCalled();
        expect(mockJwtService.sign).not.toHaveBeenCalled();
    });

    /**
     * In this case the given password does not match with previously stored password
     * Make sure respective handler throw InvalidCredentialsError
     * Further process will not be proceeded
     */

    it('should throw InvalidCredentialsError if password does not match', async () => {
        const userId = uuidv4();
        const username = 'testuser';
        const password = 'Password123!';
        const hashedPassword = 'hashedPassword123!';
        const mockUser = new User(
            userId,
            username,
            '1234567890',
            hashedPassword,
        );

        mockUserRepository.findByUsername.mockResolvedValue(mockUser);
        mockHasherService.compare.mockResolvedValue(false); // Password mismatch

        const command = new LoginUserCommand(username, password);

        await expect(handler.execute(command)).rejects.toThrow(
            InvalidCredentialsError,
        );
        await expect(handler.execute(command)).rejects.toThrow(
            'Invalid password for current username.',
        );
        expect(mockHasherService.compare).toHaveBeenCalledWith(
            password,
            hashedPassword,
        );
        expect(
            mockDynamicCodeService.generateDynamicCode,
        ).not.toHaveBeenCalled();
        expect(mockJwtService.sign).not.toHaveBeenCalled();
    });
});
