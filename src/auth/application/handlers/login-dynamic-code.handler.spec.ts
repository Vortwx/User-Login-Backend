import { LoginDynamicCodeCommandHandler } from './login-dynamic-code.handler';
import { LoginDynamicCodeCommand } from '../commands/login-dynamic-code.command';
import { IUserRepository } from '../../../shared/domain/user/interfaces/user.interface';
import { IJwtService } from '../../domain/interfaces/jwt-service.interface';
import { IDynamicCodeService } from '../../domain/interfaces/dynamic-code-service.interface';
import { User } from '../../../shared/domain/user/entities/user.entity';
import { UnauthorizedException } from '@nestjs/common';
import { InvalidDynamicCodeError } from '../../domain/exceptions/invalid-dynamic-code.error';
import { UserNotFoundError } from '../../../shared/domain/exceptions/user-not-found.error';
import { v4 as uuidv4 } from 'uuid';

describe('LoginDynamicCodeCommandHandler', () => {
    let handler: LoginDynamicCodeCommandHandler;
    let mockUserRepository: jest.Mocked<IUserRepository>;
    let mockJwtService: jest.Mocked<IJwtService>;
    let mockDynamicCodeService: jest.Mocked<IDynamicCodeService>;

    beforeEach(() => {
        mockUserRepository = {
            findByUsername: jest.fn(),
            findById: jest.fn(),
            findByPhoneNumber: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
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

        handler = new LoginDynamicCodeCommandHandler(
            mockUserRepository,
            mockJwtService,
            mockDynamicCodeService,
        );
    });

    /**
     * This scenario is a success path.
     * Ensure the following processes are followed:
     * 1. JWT will verify preAuthToken
     * 2. Dynamic code will be verified
     * 3. User will be found in DB
     * 4. JWT will sign sessionToken
     * 5. SessionToken will be returned
     */

    it('should successfully login dynamic code', async () => {
        const userId = uuidv4();
        const username = 'testuser';
        const preAuthToken = 'mockPreAuthToken';
        const dynamicCode = '123456';
        const sessionToken = 'mockSessionToken';

        const mockUser = new User(
            userId,
            username,
            '1234567890',
            'hashedpassword',
        );

        mockJwtService.verify.mockResolvedValue({
            sub: userId,
            purpose: 'dynamic_code_verification',
        });
        mockDynamicCodeService.verifyDynamicCode.mockResolvedValue(true);
        mockUserRepository.findById.mockResolvedValue(mockUser);
        mockJwtService.sign.mockResolvedValue(sessionToken);

        const command = new LoginDynamicCodeCommand(preAuthToken, dynamicCode);
        const result = await handler.execute(command);

        expect(mockJwtService.verify).toHaveBeenCalledWith(preAuthToken, process.env.JWT_SECRET || undefined);
        expect(mockDynamicCodeService.verifyDynamicCode).toHaveBeenCalledWith(
            userId,
            dynamicCode,
        );
        expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
        expect(mockJwtService.sign).toHaveBeenCalledWith({
            sub: userId,
            username: username,
        });
    });

    /**
     * In this case the preAuthToken fail the verification of JWT service
     * The handler should throw an UnauthorizedException
     * No other processes should be executed
     */

    it('should throw UnauthorizedException if preAuthToken is invalid', async () => {
        mockJwtService.verify.mockRejectedValue(new Error('Invalid token'));

        const command = new LoginDynamicCodeCommand('invalidToken', '123456');

        await expect(handler.execute(command)).rejects.toThrow(
            UnauthorizedException,
        );
        await expect(handler.execute(command)).rejects.toThrow(
            'Invalid or expired Dynamic Code.',
        );
        expect(mockDynamicCodeService.verifyDynamicCode).not.toHaveBeenCalled();
    });

    /**
     * In this case the preAuthToken purpose is not 'dynamic_code_verification'
     * The handler should throw an UnauthorizedException
     * No other processes should be executed
     */

    it('should throw UnauthorizedException if preAuthToken purpose is incorrect', async () => {
        mockJwtService.verify.mockResolvedValue({
            sub: uuidv4(),
            purpose: 'some_other_purpose',
        });

        const command = new LoginDynamicCodeCommand('validToken', '123456');

        await expect(handler.execute(command)).rejects.toThrow(
            UnauthorizedException,
        );
        await expect(handler.execute(command)).rejects.toThrow(
            'Invalid or expired Dynamic Code.',
        );
        expect(mockDynamicCodeService.verifyDynamicCode).not.toHaveBeenCalled();
    });

    /**
     * In this case the dynamic code verification fails
     * The handler should throw an InvalidDynamicCodeError
     * No further processes should be executed
     */

    it('should throw InvalidDynamicCodeError if dynamic code verification fails', async () => {
        const userId = uuidv4();
        mockJwtService.verify.mockResolvedValue({
            sub: userId,
            purpose: 'dynamic_code_verification',
        });
        mockDynamicCodeService.verifyDynamicCode.mockResolvedValue(false);

        const command = new LoginDynamicCodeCommand('validToken', 'wrongCode');

        await expect(handler.execute(command)).rejects.toThrow(
            InvalidDynamicCodeError,
        );
        await expect(handler.execute(command)).rejects.toThrow(
            'Invalid or expired Dynamic Code.',
        );
        expect(mockUserRepository.findById).not.toHaveBeenCalled();
    });

    /**
     * All the previous processes are successful
     * However user not found after validation of Dynamic Code
     * Practically unreachable as it will fail first at login-user.handler
     */

    it('should throw UserNotFoundError if user not found after valid code', async () => {
        const userId = uuidv4();
        mockJwtService.verify.mockResolvedValue({
            sub: userId,
            purpose: 'dynamic_code_verification',
        });
        mockDynamicCodeService.verifyDynamicCode.mockResolvedValue(true);
        mockUserRepository.findById.mockResolvedValue(null);

        const command = new LoginDynamicCodeCommand('validToken', '123456');

        await expect(handler.execute(command)).rejects.toThrow(
            UserNotFoundError,
        );
        await expect(handler.execute(command)).rejects.toThrow(
            'User not found after successful dynamic code verification.',
        );
        expect(mockJwtService.sign).not.toHaveBeenCalled();
    });
});
