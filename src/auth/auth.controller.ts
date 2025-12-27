import { BadRequestException, Body, Controller, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GetCurrentUserId, Public } from '~/common/decorators';
import { LoginDto, RegisterDto, ResendOtpDto, UserIdResponseDto, VerifyOtpDto } from './dto';
import { ApiCookieAuth, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { MessageResponseDto } from '~/common/dto/response.dto';
import { TokensDto } from '~/jwt-token/dto/jwt-token.dto';
import { Tokens } from '~/jwt-token/types/jwt-token.types';
import { Response } from 'express';
import { CookiesService } from '~/cookies/cookies.service';
import { IRequestWithCookies } from './types/auth.types';
import { RtGuard } from '~/common/guards/rt.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cookiesService: CookiesService,
  ) {
  }

  @Public()
  @ApiCreatedResponse({ type: UserIdResponseDto })
  @Post('/register')
  async register(@Body() dto: RegisterDto): Promise<UserIdResponseDto> {
    return this.authService.register(dto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: TokensDto })
  @Post('/login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Tokens> {
    const tokens = await this.authService.login(dto);
    this.cookiesService.addTokensToCookies(res, tokens);
    return tokens;
  }

  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth()
  @ApiOkResponse({ schema: { example: true } })
  async logout(
    @GetCurrentUserId() userId: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<MessageResponseDto> {
    const result = await this.authService.logout(userId);
    this.cookiesService.removeTokensFromResponse(response);
    return result;
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @UseGuards(RtGuard)
  @ApiOkResponse({ type: TokensDto })
  @Post('/refresh')
  async refresh(
    @GetCurrentUserId() userId: string,
    @Req() req: IRequestWithCookies,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Tokens> {
    const { refreshToken: refreshTokenFromCookies } = req.cookies;
    if (!refreshTokenFromCookies) {
      throw new BadRequestException('Refresh token missed');
    }
    const tokens = await this.authService.refreshTokens(
      userId,
      refreshTokenFromCookies,
    );

    this.cookiesService.addTokensToCookies(res, tokens);
    return tokens;
  }

  @Public()
  @ApiOkResponse({ type: MessageResponseDto })
  @HttpCode(HttpStatus.OK)
  @Post('/verify-otp')
  async verifyOtp(@Body() dto: VerifyOtpDto): Promise<MessageResponseDto> {
    return this.authService.verifyOtp(dto);
  }

  @Public()
  @ApiOkResponse({ type: MessageResponseDto })
  @HttpCode(HttpStatus.OK)
  @Post('/resend-otp')
  async resendOtp(@Body() dto: ResendOtpDto): Promise<MessageResponseDto> {
    return this.authService.resendOtp(dto);
  }
}
