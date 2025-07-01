import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule as NestJwtModule } from '@nestjs/jwt';

import { PrismaUserRepository } from './infrastructure/persistence/prisma-user.repository';
import { BcryptHasherService } from './infrastructure/providers/bcrypt-hasher.service';
import { JwtService } from './infrastructure/providers/jwt.service';
import { DynamicCodeService } from './infrastructure/providers/dynamic-code.service';

import { USER_REPOSITORY_TOKEN } from './domain/user/interfaces/user.interface';
import { HASHER_SERVICE_TOKEN } from 'src/app/modules/auth/domain/interfaces/hasher.service.interface';
import { JWT_SERVICE_TOKEN } from 'src/app/modules/auth/domain/interfaces/jwt-service.interface';
import { DYNAMIC_CODE_SERVICE_TOKEN } from 'src/app/modules/auth/domain/interfaces/dynamic-code-service.interface';

@Global()
@Module({
  imports: [
    ConfigModule,
    NestJwtModule.registerAsync({
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
            secret: configService.get<string>('JWT_SECRET'),
            signOptions: { expiresIn: '1h' }, // Session token is 1 hour long by default
        }),
        inject: [ConfigService],
    }),
  ],
  providers: [
    { provide: USER_REPOSITORY_TOKEN, useClass: PrismaUserRepository },
    { provide: HASHER_SERVICE_TOKEN, useClass: BcryptHasherService },
    { provide: JWT_SERVICE_TOKEN, useClass: JwtService },
    { provide: DYNAMIC_CODE_SERVICE_TOKEN, useClass: DynamicCodeService },
  ],
  exports: [
    USER_REPOSITORY_TOKEN,
    HASHER_SERVICE_TOKEN,
    JWT_SERVICE_TOKEN,
    DYNAMIC_CODE_SERVICE_TOKEN,
  ],
})
export class SharedModule {}