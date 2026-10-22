import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}
  httpExceptionBuilder(error: string, status: HttpStatus): HttpException {
    return new HttpException(
      {
        error: error,
      },
      status,
      { cause: error },
    );
  }
  async getUserById(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        userId: userId,
      },
    });
    if (user == null) {
      throw this.httpExceptionBuilder('User Not Found!', HttpStatus.NOT_FOUND);
    }
    return {
      userId: user.userId,
      username: user.username,
      email: user.email,
      country: user.country,
      role: user.role,
    };
  }
}
