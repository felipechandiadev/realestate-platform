import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from '../../users/dto/user.dto';
import { CreateUserCommunityDto } from '../../users/dto/create-user-community.dto';
import { SignInUseCase } from './use-cases/sign-in.usecase';
import { SignOutUseCase } from './use-cases/sign-out.usecase';
import { RefreshTokenUseCase } from './use-cases/refresh-token.usecase';
import { RegisterUserUseCase } from './use-cases/register-user.usecase';
import { VerifyEmailUseCase } from './use-cases/verify-email.usecase';
import { ResendVerificationEmailUseCase } from './use-cases/resend-verification-email.usecase';

@Injectable()
export class AuthService {
  constructor(
    private readonly signInUseCase: SignInUseCase,
    private readonly signOutUseCase: SignOutUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly registerUseCase: RegisterUserUseCase,
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
    private readonly resendEmailUseCase: ResendVerificationEmailUseCase,
  ) {}

  async signIn(loginDto: LoginDto) {
    return this.signInUseCase.execute(loginDto);
  }

  async signOut(authorizationHeader?: string) {
    return this.signOutUseCase.execute(authorizationHeader);
  }

  async refresh(authorizationHeader?: string) {
    return this.refreshTokenUseCase.execute(authorizationHeader);
  }

  /**
   * Register a new COMMUNITY user from portal
   * Sends verification email
   */
  async register(
    createUserCommunityDto: CreateUserCommunityDto,
  ) {
    return this.registerUseCase.execute(createUserCommunityDto);
  }

  /**
   * Verify user email using token
   */
  async verifyEmail(token: string) {
    return this.verifyEmailUseCase.execute(token);
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string) {
    return this.resendEmailUseCase.execute(email);
  }
}
