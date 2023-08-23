import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AtStrategy } from './strategies/access.strategy';
import { RtStrategy } from './strategies/refresh.strategy';
import { PasswordService } from './password.service';

@Module({
  providers: [AuthService, AtStrategy, RtStrategy, PasswordService],
  controllers: [AuthController],
  imports: [JwtModule.register({})],
})
export class AuthModule {}
