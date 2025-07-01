import { Module } from '@nestjs/common';
import { UserController } from './api/user.controller';
import { SharedModule } from '../shared/shared.module';
import { AuthModule } from '../auth/auth.module';
import { CqrsModule } from '@nestjs/cqrs';

import { GetUserProfileQueryHandler } from './application/handlers/get-user-profile.handler';

@Module({
  imports: [
    SharedModule,
    AuthModule,
    CqrsModule,
  ],
  controllers: [UserController],
  providers: [
    GetUserProfileQueryHandler,
  ],
  exports: [],
})
export class UserModule {}