import { Module } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { JwtStrategyAdmin } from './jwt.strategy.admin';
@Module({
  providers: [JwtStrategy, JwtStrategyAdmin],
  exports: [JwtStrategy, JwtStrategyAdmin],
})
export class GuardModule {}
