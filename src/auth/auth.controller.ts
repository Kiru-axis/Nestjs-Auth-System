import {
  Controller,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { CurrentUser, PublicRoute } from 'src/common';
import { RefreshGuard } from 'src/common/guards/refresh.guard';
import { User } from '@prisma/client';
import {
  ForgotPasswordDto,
  ResetPasswordDto,
  SigninDto,
  SignupDto,
} from './dto';
import { IJwtPayload } from './types';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(RefreshGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('refresh')
  async refresh(
    @CurrentUser() userData: { refreshToken: string; payload: IJwtPayload },
    @Res({ passthrough: true }) res: Response,
  ) {
    // The user data is a result of the refreshStrategy

    const { accessToken, refreshToken } = await this.authService.refresh(
      userData.payload.sub,
      userData.refreshToken,
    );

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      sameSite: 'none',
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'none',
    });
  }

  @PublicRoute()
  @HttpCode(HttpStatus.CREATED)
  @Post('signup')
  async signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @PublicRoute()
  @HttpCode(HttpStatus.OK)
  @Post('signin')
  async signin(
    @Body() dto: SigninDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { tokens, data } = await this.authService.signin(dto);

    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      sameSite: 'none',
    });
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      sameSite: 'none',
    });

    return data;
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('signout')
  async signout(
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user: User,
  ) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return this.authService.signout(user);
  }

  // @HttpCode(HttpStatus.NO_CONTENT)
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('reset-password/:token')
  async resetPassword(
    @Body() dto: ResetPasswordDto,
    @Param('token') token: string,
    @CurrentUser() user: User,
  ) {
    return this.authService.resetPassword(dto, token, user);
  }
}
