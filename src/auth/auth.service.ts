import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { LoginDto, RegisterDto, ResendOtpDto, VerifyOtpDto } from './dto';
import { PrismaService } from '~/prisma/prisma.service';
import { generateOtp } from '~/common/utils/utils';
import { MailgunService } from '~/mailgun/mailgun.service';
import { MessageResponseDto } from '~/common/dto/response.dto';
import { HashingService } from '~/hashing/hashing.service';
import { JwtTokenService } from '~/jwt-token/jwt-token.service';
import { Tokens } from '~/jwt-token/types/jwt-token.types';

@Injectable()
export class AuthService {
  private readonly templateName = 'registration';
  private readonly OTP_EXPIRATION_MS = 10 * 60 * 1000; // 10m

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailgunService: MailgunService,
    private readonly hashingService: HashingService,
    private readonly jwtTokenService: JwtTokenService,
  ) {
  }

  async register(registerDto: RegisterDto): Promise<{ userId: string }> {
    const oldUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });
    if (oldUser) throw new BadRequestException('User already exists');

    const otpCode = generateOtp();
    const hashedPassword = await this.hashingService.hash(registerDto.password);

    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        credentials: {
          create: {
            hashedPassword,
            verificationToken: otpCode.toString(),
            verificationTokenExpiresAt: new Date(Date.now() + this.OTP_EXPIRATION_MS),
          },
        },
      },
    });

    await this.mailgunService.sendTemplateEmail({
      to: registerDto.email,
      template: this.templateName,
      variables: {
        name: registerDto.firstName,
        passcode: otpCode,
      },
    });

    return { userId: user.id };
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<MessageResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { credentials: true },
    });

    if (!user) throw new NotFoundException('User not found');

    const credentials = user.credentials;
    if (!credentials?.verificationTokenExpiresAt) {
      throw new BadRequestException('No credentials found');
    }

    if (
      credentials.verificationToken !== dto.otpCode ||
      credentials.verificationTokenExpiresAt < new Date()
    ) throw new BadRequestException('Invalid or expired OTP');

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        confirmed: true,
        credentials: {
          update: {
            verificationToken: null,
            verificationTokenExpiresAt: null,
          },
        },
      },
    });

    return { message: 'OTP verified successfully' };
  }

  async resendOtp(dto: ResendOtpDto): Promise<MessageResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { credentials: true },
    });

    if (!user) throw new NotFoundException('User not found');
    if (!user.credentials) throw new BadRequestException('No credentials found');

    const newOtp = generateOtp();

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        credentials: {
          update: {
            verificationToken: newOtp.toString(),
            verificationTokenExpiresAt: new Date(Date.now() + this.OTP_EXPIRATION_MS),
          },
        },
      },
    });

    await this.mailgunService.sendTemplateEmail({
      to: user.email,
      template: this.templateName,
      variables: {
        name: user.firstName,
        passcode: newOtp,
      },
    });

    return { message: 'OTP resent successfully' };
  }

  async login(loginDto: LoginDto): Promise<Tokens> {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
      include: { credentials: true },
    });

    if (!user || !user.credentials?.hashedPassword) {
      throw new ForbiddenException('Wrong email or password');
    }

    if (!user.confirmed) {
      throw new ForbiddenException('Please confirm your email before login');
    }

    const passwordMatches = await this.hashingService.compare(
      loginDto.password,
      user.credentials.hashedPassword,
    );
    if (!passwordMatches) {
      throw new ForbiddenException('Wrong email or password');
    }

    const tokens = await this.jwtTokenService.signTokens({
      email: user.email,
      sub: user.id,
    });
    await this.updateRt(user.id, tokens.refreshToken);
    return tokens;
  }

  async updateRt(userId: string, rt: string): Promise<void> {
    const hashedRt = await this.hashingService.hash(rt);
    await this.prisma.userCredentials.update({
      where: { userId },
      data: { hashedRt },
    });
  }

  async refreshTokens(userId: string, rt: string): Promise<Tokens> {
    const userCredentials = await this.prisma.userCredentials.findUnique({
      where: { userId },
      include: { user: true },
    });
    if (!userCredentials?.hashedRt) {
      throw new ForbiddenException('Refresh token not found');
    }

    const rtMatches = await this.hashingService.compare(rt, userCredentials.hashedRt);
    if (!rtMatches) {
      throw new ForbiddenException('Refresh token is invalid');
    }

    const tokens = await this.jwtTokenService.signTokens({
      email: userCredentials.user.email,
      sub: userCredentials.user.id,
    });

    await this.updateRt(userCredentials.user.id, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: string): Promise<MessageResponseDto> {
    await this.prisma.userCredentials.update({
      where: { userId },
      data: { hashedRt: null },
    });

    return { message: 'Successful logout' };
  }
}
