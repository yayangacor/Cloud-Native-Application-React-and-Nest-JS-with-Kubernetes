import { Module } from '@nestjs/common';
import { RunController } from './run.controller';
import { RunService } from './run.service';
import { PrismaModule } from '../prisma/prisma.module';
import { GuardModule } from '../guard/guard.module';
@Module({
  imports: [PrismaModule, GuardModule],
  controllers: [RunController],
  providers: [RunService],
  exports: [RunService],
})
export class RunModule {}
