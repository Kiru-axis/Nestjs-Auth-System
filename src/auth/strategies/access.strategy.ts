import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { IJwtPayload } from '../types';

// these function only extracts access tokens
export function fromCookies() {
  return (req: Request) => {
    let token: string;

    if (req && req.cookies) {
      token = req.cookies['accessToken'];
    }
    return token;
  };
}

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        fromCookies(),
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get('ACCESS_TOKEN_SECRET'),
    });
  }
  async validate(payload: IJwtPayload) {
    return await this.prisma.user.findUnique({
      where: { email: payload.email },
    });
  }
}
