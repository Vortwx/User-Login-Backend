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

import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class AuthController {
    constructor(private readonly commandBus: CommandBus) {}

    @Post('create')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new user' })
    @ApiBody({
      type: CreateUserCommand,
      description: 'Required user information to create a new user',
    })
    @ApiResponse({
      status: HttpStatus.CREATED,
      description: 'User created successfully',
      type: CreateUserCommandResponse
    })
    @ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'User already exists'
    })
    @ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Validation failed in request body'
    })
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
    @ApiOperation({ summary: 'Perform login operation for a user' })
    @ApiBody({
      type: LoginUserCommand,
      description: 'Required user information to login'
    })
    @ApiResponse({
      status: HttpStatus.OK,
      description: 'User logged in successfully',
      type: LoginUserCommandResponse
    })
    @ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Invalid credentials provided'
    })
    @ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Validation failed in request body'
    })
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
    @ApiOperation({ summary: 'Perform dynamic code verification for user' })
    @ApiBody({
      type: LoginDynamicCodeCommand,
      description: 'Required user information to login with dynamic code'
    })
    @ApiResponse({
      status: HttpStatus.OK,
      description: 'User logged in successfully',
      type: LoginDynamicCodeCommandResponse
    })
    @ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Invalid pre-Authentication token  or invalid dynamic code'
    })
    @ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'User not found after successful dynamic code verification'
    })
    @ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Validation failed in request body'
    })
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