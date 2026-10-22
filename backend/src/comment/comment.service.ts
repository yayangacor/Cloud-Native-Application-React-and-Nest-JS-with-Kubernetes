import { HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CommentService {
  constructor(private readonly prismaService: PrismaService) {}

  httpExceptionBuilder(error: string, status: HttpStatus): HttpException {
    return new HttpException(
      {
        error: error,
      },
      status,
      { cause: error },
    );
  }

  async insertComment(runId: string, userId: string, comment: string) {
    const createdComment = await this.prismaService.runComment.create({
      data: {
        runId: runId,
        userId: userId,
        comment: comment,
      },
    });
    return createdComment;
  }
}
