import { Body, Controller, Post, HttpCode, HttpStatus, UsePipes, ValidationPipe } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { UnauthorizedException } from '@nestjs/common';

import { CreateUserCommand, CreateUserCommandResponse } from '../application/commands/create-user.command';
import { LoginUserCommand, LoginUserCommandResponse } from '../application/commands/login-user.command';
import { LoginDynamicCodeCommand, LoginDynamicCodeCommandResponse } from '../application/commands/login-dynamic-code.command';

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
      if (error instanceof Error) {
          if (error.message.includes('already exists') || error.message.includes('already registered')) {
              throw new UnauthorizedException(error.message);
          }
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
      if (error instanceof UnauthorizedException) {
        throw error;
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
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw error;
    }
  }
}