import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { PrismaFilter } from './prisma/prisma.filter';
import { JwtAuthGuard } from './common/guards/auth.guard';
import { RolesGuard } from './common/guards/role.guard';
import { MailingModule } from './mailing/mailing.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, AuthModule, MailingModule],
  providers: [
    { provide: APP_FILTER, useClass: PrismaFilter },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
