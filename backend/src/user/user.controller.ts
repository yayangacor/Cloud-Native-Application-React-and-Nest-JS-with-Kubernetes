import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { JwtDto } from '../guard/dto/jwt.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { Request } from 'express';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiOperation({
    summary: 'Get Logined User Profile',
    description: 'Get Authenticated User Profile, Need General JWT Token',
  })
  @ApiResponse({
    status: 200,
    description: 'Return Authenticated User Data',
  })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  async getMe(@Req() req: Request & { user: JwtDto }) {
    const userId = req.user.userId;
    const user = await this.userService.getUserById(userId);
    return user;
  }
}
