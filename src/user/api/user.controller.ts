import {
    Controller,
    Get,
    Param,
    UseGuards,
    HttpStatus,
    Res,
    ParseUUIDPipe,
    HttpCode,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../shared/infrastructure/providers/jwt-auth-guard';
import { UserNotFoundError } from '../../shared/domain/exceptions/user-not-found.error';
import { Response } from 'express';

import {
    GetUserProfileQuery,
    GetUserProfileQueryResult,
} from '../application/queries/get-user-profile.query';
import {
    ApiTags,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiSecurity,
} from '@nestjs/swagger';

@ApiTags('User')
@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
    constructor(private readonly queryBus: QueryBus) {}

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiSecurity('cookieAuth')
    @ApiOperation({ summary: 'Get user profile by user ID' })
    @ApiParam({
        name: 'id',
        description: 'The unique ID of the user',
        type: 'string',
        format: 'uuid',
        example: '11111111-2222-4333-a444-555566667777'
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Returns the user detail',
        type: GetUserProfileQueryResult
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'User not found'
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid UUID format for user ID.'
    })
    async getUserProfile(
        @Param('id', ParseUUIDPipe) id: string,
        @Res() res: Response,
    ) {
        try {
            const query = new GetUserProfileQuery(id);
            const userProfile = await this.queryBus.execute(query);
            return res.status(HttpStatus.OK).json(userProfile);
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                return res
                    .status(HttpStatus.NOT_FOUND)
                    .json({ message: error.message });
            }
            throw error;
        }
    }
}
