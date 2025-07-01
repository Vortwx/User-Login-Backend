import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

import { SharedModule } from './app/modules/shared/shared.module';
import { AuthModule } from './app/modules/auth/auth.module';
import { UserModule } from './app/modules/user/user.module';


@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
    PrismaModule,
    SharedModule,
    AuthModule,
    UserModule
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
