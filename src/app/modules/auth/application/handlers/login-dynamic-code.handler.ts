import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoginDynamicCodeCommand, LoginDynamicCodeCommandResponse } from '../commands/login-dynamic-code.command'
import { IUserRepository, USER_REPOSITORY_TOKEN } from '../../../shared/domain/user/interfaces/user.interface';
import { IJwtService, JWT_SERVICE_TOKEN } from '../../domain/interfaces/jwt-service.interface';
import { IDynamicCodeService, DYNAMIC_CODE_SERVICE_TOKEN } from '../../domain/interfaces/dynamic-code-service.interface';
import { InvalidDynamicCodeError } from '../../domain/exceptions/invalid-dynamic-code.error';
import { UserNotFoundError } from '../../../shared/domain/exceptions/user-not-found.error';

@Injectable()
@CommandHandler(LoginDynamicCodeCommand)
export class LoginDynamicCodeCommandHandler implements ICommandHandler<LoginDynamicCodeCommand> {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    @Inject(JWT_SERVICE_TOKEN)
    private readonly jwtService: IJwtService,
    @Inject(DYNAMIC_CODE_SERVICE_TOKEN)
    private readonly dynamicCodeService: IDynamicCodeService,
  ) {}

  async execute(command: LoginDynamicCodeCommand): Promise<LoginDynamicCodeCommandResponse> {
    let userId: string;
    try {
      const payload: { sub: string; purpose: string } = await this.jwtService.verify(command.preAuthToken);
      if (payload.purpose !== 'dynamic_code_verification') {
        throw new UnauthorizedException(); // This will be masked by the error thrown by catch
      }
      userId = payload.sub;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired pre-Authentication token.');
    }

    const isCodeValid = await this.dynamicCodeService.verifyDynamicCode(userId, command.dynamicCode);
    if (!isCodeValid) {
      throw new InvalidDynamicCodeError();
    }
    
    const user = await this.userRepository.findById(userId);
    if (!user) {
        throw new UserNotFoundError('User not found after successful dynamic code verification.');
    }

    const sessionToken = await this.jwtService.sign({ sub: user.id, username: user.username });

    return {
      sessionToken: sessionToken,
    };
  }
}