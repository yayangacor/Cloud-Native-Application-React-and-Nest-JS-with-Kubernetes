import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { JwtPayload } from './dto/jwt.dto';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategyAdmin extends PassportStrategy(Strategy, 'jwt-admin') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET!,
    });
  }

  validate(JwtPayload: JwtPayload) {
    if (JwtPayload.role !== 'ADMIN') {
      throw new HttpException('Unauthorized Access!', HttpStatus.UNAUTHORIZED);
    }
    return { userId: JwtPayload.userId, role: JwtPayload.role };
  }
}
