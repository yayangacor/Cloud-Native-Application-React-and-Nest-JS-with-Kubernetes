import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RunService } from './run.service';
import { JwtDto } from '../guard/dto/jwt.dto';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RunRequestDto } from './dto/run.request.dto';
import { Request } from 'express';

@ApiTags('Runs')
@Controller()
export class RunController {
  constructor(private readonly runService: RunService) {}

  @Get('games/:gameId/runs')
  @ApiOperation({ description: 'Get the leaderboard (runs) for a game' })
  @ApiResponse({
    status: 200,
    description: 'Return all runs for the given game, fastest first',
  })
  async getRunsByGame(@Param('gameId') gameId: string) {
    const runs = await this.runService.getRunsByGame(gameId);
    return runs;
  }

  @Get('runs/:id')
  @ApiOperation({ description: 'Get Run Detail By Run ID' })
  @ApiResponse({
    status: 200,
    description: 'Return Run Detail Including Comments',
  })
  async getRunById(@Param('id') id: string) {
    const run = await this.runService.getRunById(id);
    return run;
  }

  @Post('runs')
  @ApiOperation({ description: 'Submit a New Run' })
  @ApiResponse({
    status: 200,
    description: 'Return newly inserted run data',
  })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  async insertRun(
    @Body() dto: RunRequestDto,
    @Req() req: Request & { user: JwtDto },
  ) {
    const insertedRun = await this.runService.insertRun(dto, req.user.userId);
    return insertedRun;
  }
}
