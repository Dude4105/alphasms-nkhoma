import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          let token: string | null = null;
          if (req && req.cookies) {
            token = req.cookies['refreshToken'];
          }
          if (!token && req && req.headers && req.headers.cookie) {
            // Manual parse fallback
            const cookies = req.headers.cookie.split(';');
            for (const cookie of cookies) {
              const [name, value] = cookie.trim().split('=');
              if (name === 'refreshToken') {
                token = value;
                break;
              }
            }
          }
          return token;
        },
      ]),
      secretOrKey: process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-key',
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: any) {
    let refreshToken: string | null = null;
    if (req && req.cookies) {
      refreshToken = req.cookies['refreshToken'];
    }
    if (!refreshToken && req && req.headers && req.headers.cookie) {
      const cookies = req.headers.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'refreshToken') {
          refreshToken = value;
          break;
        }
      }
    }
    return { ...payload, refreshToken };
  }
}
