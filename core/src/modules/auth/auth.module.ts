import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/domain/user.entity';
import { SessionUserService } from './application/session-user.service';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { JwtAuthGuard } from './presentation/guards/jwt-auth.guard';
import { RolesGuard } from './presentation/guards/roles.guard';
import { JweService } from './infrastructure/jwe/jwe.service';
import { AuthService } from './application/auth.service';
import { AuthController } from './presentation/auth.controller';
import { forwardRef } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { MailModule } from '../mail/mail.module';
import { SignInUseCase } from './application/use-cases/sign-in.usecase';
import { SignOutUseCase } from './application/use-cases/sign-out.usecase';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.usecase';
import { RegisterUserUseCase } from './application/use-cases/register-user.usecase';
import { VerifyEmailUseCase } from './application/use-cases/verify-email.usecase';
import { ResendVerificationEmailUseCase } from './application/use-cases/resend-verification-email.usecase';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'test-secret',
      signOptions: { expiresIn: '12h' },
    }),
    forwardRef(() => UsersModule),
    MailModule,
    TypeOrmModule.forFeature([User]),
  ],
  providers: [
    SessionUserService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    // Guards globales, deny-by-default: todo endpoint exige token salvo @Public().
    // El orden importa: primero autenticación (req.user), luego roles.
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    JweService,
    AuthService,
    SignInUseCase,
    SignOutUseCase,
    RefreshTokenUseCase,
    RegisterUserUseCase,
    VerifyEmailUseCase,
    ResendVerificationEmailUseCase,
  ],
  controllers: [AuthController],
  exports: [JwtModule, JwtAuthGuard, RolesGuard, AuthService, JweService, SessionUserService],
})
export class AuthModule {}
