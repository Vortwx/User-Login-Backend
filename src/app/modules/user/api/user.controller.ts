import { Controller, Get, Param, UseGuards, HttpStatus, Res } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../auth/infrastructure/jwt-auth-guard';
// import { UserNotFoundError } from '../../shared/domain/exceptions/user-not-found.error';
import { Response } from 'express';

import { GetUserProfileQuery, GetUserProfileQueryResult } from '../application/queries/get-user-profile.query';

@Controller('user')
export class UserController {
  constructor(private readonly queryBus: QueryBus) {}

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getUserProfile(@Param('id') id: string, @Res() res: Response) {
    try {
      const query = new GetUserProfileQuery(id);
      const userProfile = await this.queryBus.execute(query);
      return res.status(HttpStatus.OK).json(userProfile);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: error.message });
      }
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'An unexpected error occurred.' });
    }
  }
}