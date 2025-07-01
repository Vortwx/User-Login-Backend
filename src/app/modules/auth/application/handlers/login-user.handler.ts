import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoginUserCommand, LoginUserCommandResponse } from '../commands/login-user.command';
import { IUserRepository, USER_REPOSITORY_TOKEN } from '../../../shared/domain/user/interfaces/user.interface';
import { IHasherService, HASHER_SERVICE_TOKEN } from '../../domain/interfaces/hasher.service.interface';
import { IJwtService, JWT_SERVICE_TOKEN } from '../../domain/interfaces/jwt-service.interface';
import { IDynamicCodeService, DYNAMIC_CODE_SERVICE_TOKEN } from '../../domain/interfaces/dynamic-code-service.interface';

@Injectable()
@CommandHandler(LoginUserCommand)
export class LoginUserCommandHandler implements ICommandHandler<LoginUserCommand> {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    @Inject(HASHER_SERVICE_TOKEN)
    private readonly hasherService: IHasherService,
    @Inject(JWT_SERVICE_TOKEN)
    private readonly jwtService: IJwtService,
    @Inject(DYNAMIC_CODE_SERVICE_TOKEN)
    private readonly dynamicCodeService: IDynamicCodeService,
  ) {}

  async execute(command: LoginUserCommand): Promise<LoginUserCommandResponse> {
    const user = await this.userRepository.findByUsername(command.username);

    if (!user) {
      throw new UnauthorizedException('Invalid username or password.');
    }

    const isPasswordValid = await this.hasherService.compare(command.password, user.hashedPassword);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid username or password.');
    }

    const dynamicCode = this.dynamicCodeService.generateDynamicCode();
    const hashedDynamicCode = await this.hasherService.hash(dynamicCode);

    this.dynamicCodeService.storeDynamicCode(user.id, hashedDynamicCode, 5); 

    console.log(`[DEBUG] OTP for ${user.username} (ID: ${user.id}): ${dynamicCode}`); 

    const preAuthToken = await this.jwtService.sign({ sub: user.id, purpose: 'dynamic_code_verification' });

    return {
      message: 'Dynamic code required. Check your registered phone number.',
      preAuthToken: preAuthToken,
    };
  }
}