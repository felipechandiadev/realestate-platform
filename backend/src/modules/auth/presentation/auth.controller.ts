import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  Headers,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiHeader,
} from '@nestjs/swagger';
import { AuthService } from '../application/auth.service';
import { LoginDto } from '../../users/dto/user.dto';
import { CreateUserCommunityDto } from '../../users/dto/create-user-community.dto';
import { AuditInterceptor, Audit } from '../../../shared/interceptors/audit.interceptor';
import { AuditAction, AuditEntityType } from '../../../shared/enums/audit.enums';

@Controller('auth')
@ApiTags('Authentication')
@UseInterceptors(AuditInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-in')
  @ApiOperation({ summary: 'Sign in user with credentials' })
  @ApiResponse({ status: 200, description: 'Login successful, returns access token and user info' })
  @ApiBody({ type: LoginDto })
  @Audit(AuditAction.LOGIN, AuditEntityType.USER, 'User login attempt')
  async signIn(@Body(ValidationPipe) loginDto: LoginDto) {
    return this.authService.signIn(loginDto);
  }

  @Post('sign-out')
  @ApiOperation({ summary: 'Sign out user and invalidate session' })
  @ApiHeader({ name: 'authorization', description: 'Bearer token from sign-in response', required: false })
  @Audit(AuditAction.LOGOUT, AuditEntityType.USER, 'User logout request')
  async signOut(@Headers('authorization') authorization?: string) {
    return this.authService.signOut(authorization);
  }

  @Post('refresh')
  @Audit(AuditAction.READ, AuditEntityType.USER, 'Refresh access token')
  async refresh(@Headers('authorization') authorization?: string) {
    console.log('[AuthController.refresh] Authorization header received:', authorization ? `${authorization.substring(0, 20)}...` : 'none');
    return await this.authService.refresh(authorization);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register new community user' })
  @ApiBody({ type: CreateUserCommunityDto })
  @Audit(AuditAction.CREATE, AuditEntityType.USER, 'New user registration')
  async register(@Body(ValidationPipe) createUserCommunityDto: CreateUserCommunityDto) {
    return this.authService.register(createUserCommunityDto);
  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Verify user email with token' })
  async verifyEmail(@Body('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('resend-verification-email')
  @ApiOperation({ summary: 'Resend verification email' })
  async resendVerificationEmail(@Body('email') email: string) {
    return this.authService.resendVerificationEmail(email);
  }
}
