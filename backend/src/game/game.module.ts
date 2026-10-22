import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { GuardModule } from '../guard/guard.module';
@Module({
  imports: [PrismaModule, GuardModule],
  controllers: [GameController],
  providers: [GameService],
  exports: [GameService],
})
export class GameModule {}
