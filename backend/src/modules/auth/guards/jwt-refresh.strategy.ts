import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../../user/user.service';
import { Request } from 'express';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: `${process.env.JWT_REFRESH_TOKEN_SECRET}`,
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: { id: string }) {
    const refreshToken = request.headers.authorization.replace('Bearer ', '');
    // const user = this.userService.findOne(payload.id);
    // return user;

    return this.userService.getUserIfRefreshTokenMatches(
      refreshToken,
      payload.id,
    );
  }
}
