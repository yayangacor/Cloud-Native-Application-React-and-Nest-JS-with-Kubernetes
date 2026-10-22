import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RunRequestDto } from './dto/run.request.dto';

const userSelect = {
  userId: true,
  username: true,
  country: true,
};

@Injectable()
export class RunService {
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

  formatSecondsToHMS(totalSeconds: bigint) {
    const hours = totalSeconds / 3600n;
    const minutes = (totalSeconds % 3600n) / 60n;
    const seconds = totalSeconds % 60n;

    const hh = hours.toString().padStart(2, '0');
    const mm = minutes.toString().padStart(2, '0');
    const ss = seconds.toString().padStart(2, '0');

    return `${hh} Hour(s) ${mm} Minute(s) ${ss} Second(s)`;
  }

  async getRunsByGame(gameId: string) {
    const runs = await this.prismaService.run.findMany({
      where: {
        gameId: gameId,
      },
      orderBy: [
        {
          runDuration: 'asc',
        },
      ],
      include: {
        user: { select: userSelect },
      },
    });

    return runs.map((run) => ({
      ...run,
      runDuration: this.formatSecondsToHMS(run.runDuration),
    }));
  }

  async getRunById(runId: string) {
    const run = await this.prismaService.run.findFirst({
      where: {
        runId: runId,
      },
      include: {
        user: { select: userSelect },
        game: true,
        comments: {
          select: {
            commentId: true,
            comment: true,
            createdAt: true,
            user: { select: userSelect },
          },
        },
      },
    });
    if (run == null) {
      throw this.httpExceptionBuilder('Invalid Run ID!', HttpStatus.NOT_FOUND);
    }

    return {
      ...run,
      runDuration: this.formatSecondsToHMS(run.runDuration),
    };
  }

  async insertRun(dto: RunRequestDto, userId: string) {
    const insertedRun = await this.prismaService.run.create({
      data: {
        gameId: dto.gameId,
        userId: userId,
        vodUrl: dto.vodUrl,
        runDuration: dto.runDuration,
      },
    });
    return {
      ...insertedRun,
      runDuration: this.formatSecondsToHMS(insertedRun.runDuration),
    };
  }
}
