import { Module } from '@nestjs/common';
import { AuthController } from './api/auth.controller';
import { JwtStrategy } from './infrastructure/jwt.strategy';
import { SharedModule } from '../shared/shared.module';
import { PassportModule } from '@nestjs/passport';
import { CqrsModule } from '@nestjs/cqrs';

import { CreateUserCommandHandler } from './application/handlers/create-user.handler';
import { LoginUserCommandHandler } from './application/handlers/login-user.handler';
import { LoginDynamicCodeCommandHandler } from './application/handlers/login-dynamic-code.handler';

@Module({
  imports: [
    SharedModule,
    PassportModule,
    CqrsModule,
  ],
  controllers: [AuthController],
  providers: [
    CreateUserCommandHandler,
    LoginUserCommandHandler,
    LoginDynamicCodeCommandHandler,
    JwtStrategy,
  ],
  exports: [
    JwtStrategy,
  ]
})
export class AuthModule {}