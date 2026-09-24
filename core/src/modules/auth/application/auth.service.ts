import { Injectable } from '@nestjs/common';
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

  /** @deprecated Prefer signInStaff / signInCommunity */
  async signIn(loginDto: LoginDto) {
    return this.signInUseCase.execute(loginDto);
  }

  async signInStaff(loginDto: LoginDto) {
    return this.signInUseCase.execute(loginDto, 'staff');
  }

  async signInCommunity(loginDto: LoginDto) {
    return this.signInUseCase.execute(loginDto, 'community');
  }

  async signOut(authorizationHeader?: string) {
    return this.signOutUseCase.execute(authorizationHeader);
  }

  async refresh(authorizationHeader?: string) {
    return this.refreshTokenUseCase.execute(authorizationHeader);
  }

  async register(createUserCommunityDto: CreateUserCommunityDto) {
    return this.registerUseCase.execute(createUserCommunityDto);
  }

  async verifyEmail(token: string) {
    return this.verifyEmailUseCase.execute(token);
  }

  async resendVerificationEmail(email: string) {
    return this.resendEmailUseCase.execute(email);
  }
}
