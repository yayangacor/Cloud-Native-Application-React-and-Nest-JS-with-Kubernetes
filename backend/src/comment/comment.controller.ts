import { Controller, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentDto } from './dto/comment.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtDto } from '../guard/dto/jwt.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('Comments')
@Controller('runs/:runId/comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @ApiOperation({ description: 'Add a Comment to a Run' })
  @ApiResponse({
    status: 200,
    description: 'Return Newly Inserted Comment Data',
  })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  async insertComment(
    @Param('runId') runId: string,
    @Body() dto: CommentDto,
    @Req() req: Request & { user: JwtDto },
  ) {
    const insertedComment = await this.commentService.insertComment(
      runId,
      req.user.userId,
      dto.comment,
    );
    return insertedComment;
  }
}
