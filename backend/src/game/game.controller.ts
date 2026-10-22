import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { GameDto } from './dto/game.dto';
import { GameService } from './game.service';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Games')
@Controller('games')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get()
  @ApiOperation({ summary: 'Get All Games Data' })
  @ApiResponse({ status: 200, description: 'Return an Array of Games Data' })
  async getGames() {
    const games = await this.gameService.getGames();
    return games;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Game Detail By ID' })
  @ApiResponse({ status: 200, description: 'Return Game Detail Data' })
  async getGame(@Param('id') id: string) {
    const game = await this.gameService.getGameById(id);
    return game;
  }

  @Post()
  @ApiOperation({
    summary: 'Insert a New Game',
    description: 'Insert a new Game, Need Admin Role in JWT Token',
  })
  @ApiResponse({
    status: 201,
    description: 'Return Newly Inserted Game Data',
  })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt-admin'))
  async insertGame(@Body() dto: GameDto) {
    const insertedGame = await this.gameService.insertGame(
      dto.gameName,
      dto.gameDescription,
    );
    return insertedGame;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a Game By ID' })
  @ApiResponse({ status: 200, description: 'Return Updated Game Data' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt-admin'))
  async updateGame(@Body() dto: GameDto, @Param('id') id: string) {
    const updatedGame = await this.gameService.updateGame(
      id,
      dto.gameName,
      dto.gameDescription,
    );
    return updatedGame;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a Game By ID' })
  @ApiResponse({ status: 200, description: 'Return Deleted Game Data' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt-admin'))
  async deleteGame(@Param('id') id: string) {
    const deletedGame = await this.gameService.deleteGame(id);
    return deletedGame;
  }
}
