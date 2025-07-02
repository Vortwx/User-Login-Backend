import {
    Body,
    Controller,
    Get,
    Post,
    HttpCode,
    HttpStatus,
    UsePipes,
    ValidationPipe,
    ConflictException,
    NotFoundException,
    Res,
    Req,
    UseGuards
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Response, Request } from 'express';
import { UnauthorizedException } from '@nestjs/common';

import {
    CreateUserCommand,
    CreateUserCommandResponse,
} from '../application/commands/create-user.command';
import {
    LoginUserCommand,
    LoginUserCommandResponse,
} from '../application/commands/login-user.command';
import {
    LoginDynamicCodeCommand,
} from '../application/commands/login-dynamic-code.command';
import { DuplicateUserError } from '../domain/exceptions/duplicate-user.error';
import { InvalidCredentialsError } from '../domain/exceptions/invalid-credentials.error';
import { InvalidDynamicCodeError } from '../domain/exceptions/invalid-dynamic-code.error';
import { UserNotFoundError } from '../../shared/domain/exceptions/user-not-found.error';

import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBody,
    ApiSecurity,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../shared/infrastructure/providers/jwt-auth-guard';


@ApiTags('Auth')
@Controller('auth')
@UsePipes(
    new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }),
)
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
        type: CreateUserCommandResponse,
    })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'User already exists',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Validation failed in request body',
    })
    async create(
        @Body() command: CreateUserCommand,
    ): Promise<CreateUserCommandResponse> {
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
        description: 'Required user information to login',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User logged in successfully',
        type: LoginUserCommandResponse,
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Invalid credentials provided',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Validation failed in request body',
    })
    // @Res({ passthrough: true }) to directly modify the res object but still let NestJS handle the response body automatically
    async login(
        @Body() command: LoginUserCommand,
    ): Promise<LoginUserCommandResponse> {
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
        description: 'Required user information to login with dynamic code',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User logged in successfully',
        headers: {
            'Set-Cookie': {
                description: 'HttpOnly session token cookie for authentication',
                schema: {
                    type: 'string',
                    example:
                        'session_token=[JWT token]; HttpOnly; Secure; Max-Age=3600000',
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description:
            'Invalid pre-Authentication token  or invalid dynamic code',
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description:
            'User not found after successful dynamic code verification',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Validation failed in request body',
    })
    async loginWithDynamicCode(
        @Body() command: LoginDynamicCodeCommand,
        @Res({ passthrough: true }) res: Response,
    ): Promise<void> {
        try {
            const result = await this.commandBus.execute(command);

            if (result.sessionToken){
                // Work under expectation of EXPIRATION_DURATION is based on hours
                let maxAgeMs = parseInt(process.env.TOKEN_EXPIRATION_DURATION!)*60*60*1000;

                res.cookie('session_token', result.sessionToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'none', // To enable cross-site cookies
                    maxAge: maxAgeMs, // 1 hour
                });
            }

            return result;

        } catch (error) {
            if (error instanceof InvalidDynamicCodeError) {
                throw new UnauthorizedException(error.message); // Map to 401 Unauthorized
            }
            if (error instanceof UserNotFoundError) {
                throw new NotFoundException(error.message); // Map to 404 Not Found
            }
            if (error instanceof UnauthorizedException) {
                // Case of invalid preAuthToken
                throw error;
            }
            throw error;
        }
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Perform logout operation for a user' })
    @ApiSecurity('cookieAuth')
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User logged out successfully',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'No active session to log out from',
    })
    async logout(@Res({ passthrough: true }) res: Response): Promise<void> {
        // httpOnly param can be ignored when unset cookie

        // Work under expectation of EXPIRATION_DURATION is based on hours
        let maxAgeMs = parseInt(process.env.TOKEN_EXPIRATION_DURATION!)*60*60*1000;
        res.clearCookie('session_token', {
            secure: true,
            sameSite: 'none',
            maxAge: maxAgeMs,
        });
    }

    @Get('identity')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ 
        summary: 'Get current authenticated user id', 
        description: 'Retrieves id of the newly authenticated user based on the session cookie. Should only be used to check current user identity. For subsequent requests, please use the `/user/${id}` endpoint.' 
    })
    @ApiSecurity('cookie-auth')
    @ApiResponse({ status: HttpStatus.OK, description: 'User details retrieved successfully.'})
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'User not authenticated or session expired.' })
    @UseGuards(JwtAuthGuard)
    async getIdentity(@Req() req: Request): Promise<{ id: string; }> {
        const user = req.user as { sub: string; };
        return { id: user.sub };
    }
}
