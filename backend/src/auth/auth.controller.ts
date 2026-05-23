import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  signup(@Body() body: any) {
    return this.authService.register(
      body.email,
      body.password,
      body.role as Role,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signin(@Body() body: any) {
    return this.authService.login(body.email, body.password);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Req() req: any) {
    return this.authService.logout(req.user.sub);
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refreshTokens(@Req() req: any) {
    const userId = req.user.sub;
    const refreshToken = req.user.refreshToken;
    return this.authService.refreshTokens(userId, refreshToken);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }
}
