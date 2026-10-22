import { Controller, Post, Body, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Create New Account' })
  @ApiResponse({ status: 201, description: 'Return New Account Data' })
  @ApiResponse({ status: 400, description: 'Invalid Payload' })
  async register(@Body() registerDto: RegisterDto) {
    await this.authService.register(registerDto);
    const msg = {
      msg: 'Successfully Registering Account!',
    };
    return msg;
  }

  @Post('login')
  @ApiOperation({ summary: 'Login With Existing Account' })
  @ApiResponse({ status: 201, description: 'Return a JWT Token' })
  @ApiResponse({ status: 401, description: 'Invalid Credential' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const resp = await this.authService.login(loginDto);
    res.cookie('access_token', resp.token, {
      httpOnly: true,
      secure: true,
      maxAge: 3600000,
    });
    return resp;
  }
}
