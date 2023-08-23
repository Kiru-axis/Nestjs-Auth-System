import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { IJwtPayload } from '../types';
import { PrismaService } from 'src/prisma/prisma.service';

// these function only extracts refresh tokens
export function fromCookies() {
  return (req: Request) => {
    let token: string;

    if (req && req.cookies) {
      token = req.cookies['refreshToken'];
    }

    return token;
  };
}

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
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
      secretOrKey: config.get('REFRESH_TOKEN_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: IJwtPayload) {
    // if the token is from cookies
    const refreshToken = req.cookies['refreshToken'];
    return { refreshToken, payload };
    // if the token is from auth headers
    // ...to be implemeted
  }
}
