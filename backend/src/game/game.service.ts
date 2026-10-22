import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GameService {
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
  async getGames() {
    const games = await this.prismaService.game.findMany();
    if (games == null) {
      throw this.httpExceptionBuilder('No Games Found!', HttpStatus.NOT_FOUND);
    }
    return games;
  }

  async getGameById(gameId: string) {
    const game = await this.prismaService.game.findFirst({
      where: {
        gameId: {
          equals: gameId,
        },
      },
    });

    if (game == null) {
      throw this.httpExceptionBuilder(
        'No Game With Such ID Found!',
        HttpStatus.NOT_FOUND,
      );
    }

    return game;
  }

  async insertGame(gameName: string, gameDescription: string) {
    if (gameName.trim() === '' || gameDescription.trim() === '') {
      throw this.httpExceptionBuilder(
        'All Field Must Be Filled!',
        HttpStatus.BAD_REQUEST,
      );
    }
    const game = await this.prismaService.game.create({
      data: {
        gameDescription: gameDescription,
        gameName: gameName,
      },
    });
    return {
      gameId: game.gameId,
      gameName: game.gameName,
      gameDescription: game.gameDescription,
    };
  }

  async updateGame(gameId: string, gameName: string, gameDescription: string) {
    if (gameName.trim() === '' || gameDescription.trim() === '') {
      throw this.httpExceptionBuilder(
        'All Field Must Be Filled!',
        HttpStatus.BAD_REQUEST,
      );
    }
    const updateGame = await this.prismaService.game.update({
      where: {
        gameId: gameId,
      },
      data: {
        gameName: gameName,
        gameDescription: gameDescription,
      },
    });

    return {
      gameId: updateGame.gameId,
      gameName: updateGame.gameName,
      gameDescription: updateGame.gameDescription,
    };
  }

  async deleteGame(gameId: string) {
    try {
      const deletedGame = await this.prismaService.game.delete({
        where: {
          gameId: gameId,
        },
      });
      return deletedGame;
    } catch {
      throw this.httpExceptionBuilder(
        'Game ID Not Found!',
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
