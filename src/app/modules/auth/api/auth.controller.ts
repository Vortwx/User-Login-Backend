import { Body, Controller, Post, HttpCode, HttpStatus, UsePipes, ValidationPipe, ConflictException, NotFoundException } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { UnauthorizedException } from '@nestjs/common';

import { CreateUserCommand, CreateUserCommandResponse } from '../application/commands/create-user.command';
import { LoginUserCommand, LoginUserCommandResponse } from '../application/commands/login-user.command';
import { LoginDynamicCodeCommand, LoginDynamicCodeCommandResponse } from '../application/commands/login-dynamic-code.command';
import { DuplicateUserError } from '../domain/exceptions/duplicate-user.error';
import { InvalidCredentialsError } from '../domain/exceptions/invalid-credentials.error';
import { InvalidDynamicCodeError } from '../domain/exceptions/invalid-dynamic-code.error';
import { UserNotFoundError } from '../../shared/domain/exceptions/user-not-found.error';

@Controller('auth')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
  ) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() command: CreateUserCommand): Promise<CreateUserCommandResponse> {
    try {
      return await this.commandBus.execute(command);
    } catch (error) {
      if (error instanceof DuplicateUserError) {
          throw new ConflictException(error.message); // Map to 409 Conflict
      }
      throw error;
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() command: LoginUserCommand): Promise<LoginUserCommandResponse> {
    try {
      return await this.commandBus.execute(command);
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        throw new UnauthorizedException(error.message); // Map to 401 Unauthorized
      }
      throw error;
    }
  }

  @Post('login/dynamic-code')
  @HttpCode(HttpStatus.OK)
  async loginWithDynamicCode(@Body() command: LoginDynamicCodeCommand): Promise<LoginDynamicCodeCommandResponse> {
    try {
      return await this.commandBus.execute(command);
    } catch (error) {
      if (error instanceof InvalidDynamicCodeError) {
        throw new UnauthorizedException(error.message); // Map to 401 Unauthorized
      }
      if (error instanceof UserNotFoundError) {
          throw new NotFoundException(error.message); // Map to 404 Not Found
      }
      if (error instanceof UnauthorizedException) { // Case of invalid preAuthToken
        throw error;
      }
      throw error;
    }
  }
}