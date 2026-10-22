import { PrismaModule } from '../prisma/prisma.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { GuardModule } from '../guard/guard.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [PrismaModule, GuardModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
