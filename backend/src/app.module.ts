import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { GuardModule } from './guard/guard.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { GameModule } from './game/game.module';
import { RunModule } from './run/run.module';
import { CommentModule } from './comment/comment.module';

@Module({
  imports: [
    PrismaModule,
    GuardModule,
    AuthModule,
    UserModule,
    GameModule,
    RunModule,
    CommentModule,
  ],
})
export class AppModule {}
