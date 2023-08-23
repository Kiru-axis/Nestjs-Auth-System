import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as dayjs from 'dayjs';
import { randomBytes, createHash } from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role, User } from '@prisma/client';
import { IJwtPayload, Tokens } from './types';
import { bCryptDecode, bCryptHash } from './utils/hashing';
import { PasswordService } from './password.service';
import { IMailerOpts } from 'src/common';
import { MailingService } from 'src/mailing/mailing.service';
import {
  ForgotPasswordDto,
  ResetPasswordDto,
  SigninDto,
  SignupDto,
} from './dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private jwtService: JwtService,
    private passwordService: PasswordService,
    private mailingService: MailingService,
  ) {}

  async signup(dto: SignupDto) {
    const password = await bCryptHash(dto.password);
    const newUser = await this.prisma.user.create({
      data: { ...dto, password: password },
    });

    return {
      success: true,
      msg: `Account for ${newUser.firstname} created.`,
    };
  }

  async signin(dto: SigninDto) {
    const user = await this.findUserByEmail(dto.email);

    const pMatches = await bCryptDecode(dto.password, user.password);

    if (!pMatches) throw new UnauthorizedException('Invalid Credentials');

    const tokens = await this.generateTokens({
      email: user.email,
      role: user.role,
      sub: user.id,
    });

    await this.hashRefreshUpdateUser(user.id, tokens.refreshToken);

    // exclude some fields
    const {
      password,
      passwordChangedAt,
      passwordResetToken,
      passwordResetTokenExiresAt,
      updatedAt,
      createdAt,
      blocked,
      refreshToken,
      ...data
    } = user;

    return { tokens, data };
  }

  async signout(user: User) {
    await this.prisma.user.update({
      where: { id: user.id, AND: { refreshToken: { not: null } } },
      data: { refreshToken: null },
    });
    return [];
  }

  async refresh(userId: number, refreshToken: string) {
    const foundUser = await this.findUserById(userId);

    const refreshMatch = await bCryptDecode(
      refreshToken,
      foundUser.refreshToken,
    );

    if (!refreshMatch) throw new ForbiddenException('Access Denied');

    const tokens = await this.generateTokens({
      email: foundUser.email,
      role: foundUser.role,
      sub: foundUser.id,
    });

    await this.hashRefreshUpdateUser(foundUser.id, tokens.refreshToken);

    return tokens;
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    try {
      const foundUser = await this.findUserByEmail(dto.email);

      const resetToken = await this.passwordService.createResetToken(
        foundUser.id,
      );

      const mailInfo: IMailerOpts = {
        subject: 'Reset Password',
        text: 'Make it alphanumeric with special characters',
        to: foundUser.email,
        html: `
          <div>Hello, Please follow the link to reset your password.
            The link is only valid for 10 minutes from now.
            <a href="http://localhost:3000/reset-password/${resetToken}">Reset</a>
          </div>`,
      };

      await this.mailingService.sendEmail(mailInfo);
      return { resetToken };
    } catch (error) {
      return error;
    }
  }

  async resetPassword(dto: ResetPasswordDto, token: string, user: User) {
    const foundUser = await this.findUserById(user.id);

    // hash the token to match the one in the db
    const hashedResetToken = createHash('sha256').update(token).digest('hex');

    // check if the token is valid
    if (hashedResetToken !== foundUser.passwordResetToken)
      throw new ForbiddenException('Access Denied: Invalid Token');

    // check if token has expired
    if (dayjs().isAfter(foundUser.passwordResetTokenExiresAt)) {
      throw new ForbiddenException('Access Denied: Token has expired');
    }

    //hash the password and update the user
    const hashPassword = await bCryptHash(dto.password);
    const updated = await this.prisma.user.update({
      where: { id: foundUser.id },
      data: {
        password: hashPassword,
        passwordChangedAt: null,
        passwordResetToken: null,
        passwordResetTokenExiresAt: null,
      },
    });

    return { success: true, msg: `Password updated` };
  }

  //   helpers
  async findUserById(id: number) {
    const foundUser = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!foundUser)
      throw new UnauthorizedException('Access Denied:Invalid credentials');
    return foundUser;
  }
  async findUserByEmail(email: string) {
    const foundUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!foundUser)
      throw new UnauthorizedException('Access Denied:Invalid credentials');
    return foundUser;
  }

  // hash the refresh token and update the user
  async hashRefreshUpdateUser(userId: number, refreshToken: string) {
    const hashedRefresh = await bCryptHash(refreshToken);

    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashedRefresh },
    });
  }

  // generate refesh and access tokens
  async generateTokens(payload: IJwtPayload): Promise<Tokens> {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get('ACCESS_TOKEN_SECRET'),
        expiresIn: this.config.get('ACCESS_TOKEN_EXPIRY'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.get('REFRESH_TOKEN_SECRET'),
        expiresIn: this.config.get('REFRESH_TOKEN_EXPIRY'),
      }),
    ]);

    return { accessToken: at, refreshToken: rt };
  }
}
