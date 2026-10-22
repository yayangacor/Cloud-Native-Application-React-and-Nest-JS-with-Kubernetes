import { Module } from '@nestjs/common';
import { CommentController } from './comment.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CommentService } from './comment.service';
import { GuardModule } from '../guard/guard.module';

@Module({
  imports: [PrismaModule, GuardModule],
  controllers: [CommentController],
  providers: [CommentService],
  exports: [CommentService],
})
export class CommentModule {}
