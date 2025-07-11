import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
    LoginUserCommand,
    LoginUserCommandResponse,
} from '../commands/login-user.command';
import {
    IUserRepository,
    USER_REPOSITORY_TOKEN,
} from '../../../shared/domain/user/interfaces/user.interface';
import {
    IHasherService,
    HASHER_SERVICE_TOKEN,
} from '../../domain/interfaces/hasher-service.interface';
import {
    IJwtService,
    JWT_SERVICE_TOKEN,
} from '../../domain/interfaces/jwt-service.interface';
import {
    IDynamicCodeService,
    DYNAMIC_CODE_SERVICE_TOKEN,
} from '../../domain/interfaces/dynamic-code-service.interface';
import { InvalidCredentialsError } from '../../domain/exceptions/invalid-credentials.error';
import { ConfigService } from '@nestjs/config';

@Injectable()
@CommandHandler(LoginUserCommand)
export class LoginUserCommandHandler
    implements ICommandHandler<LoginUserCommand>
{
    constructor(
        @Inject(USER_REPOSITORY_TOKEN)
        private readonly userRepository: IUserRepository,
        @Inject(HASHER_SERVICE_TOKEN)
        private readonly hasherService: IHasherService,
        @Inject(JWT_SERVICE_TOKEN)
        private readonly jwtService: IJwtService,
        @Inject(DYNAMIC_CODE_SERVICE_TOKEN)
        private readonly dynamicCodeService: IDynamicCodeService,
        private readonly configService: ConfigService
    ) {}

    async execute(
        command: LoginUserCommand,
    ): Promise<LoginUserCommandResponse> {
        const user = await this.userRepository.findByUsername(command.username);

        if (!user) {
            throw new InvalidCredentialsError('Invalid username.'); //Invalid username
        }

        const isPasswordValid = await this.hasherService.compare(
            command.password,
            user.hashedPassword
        );
        if (!isPasswordValid) {
            throw new InvalidCredentialsError(
                'Invalid password for current username.',
            ); // Invalid password
        }

        const dynamicCode = this.dynamicCodeService.generateDynamicCode();
        const hashedDynamicCode = await this.hasherService.hash(dynamicCode);

        this.dynamicCodeService.storeDynamicCode(user.id, hashedDynamicCode);

        console.log(
            `[DEBUG] OTP for ${user.username} (ID: ${user.id}): ${dynamicCode}`
        );

        const preAuthToken = await this.jwtService.sign(
            {
                sub: user.id,
                purpose: 'dynamic_code_verification'
            },
            {
                expiresIn: "5m", // .env call will have issue with this hence is set to fixed variable for now
                secret: process.env.JWT_TEMP_SECRET
            }
        );

        return {
            message:
                'Dynamic code required. Check your registered phone number.',
            preAuthToken: preAuthToken
        };
    }
}
