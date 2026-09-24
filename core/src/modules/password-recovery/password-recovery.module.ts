import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PasswordRecoveryService } from './application/password-recovery.service';
import { PasswordRecoveryController } from './presentation/password-recovery.controller';
import { User } from '../users/domain/user.entity';
import { PasswordResetTokenRepository } from './domain/password-reset-token.repository';
import { PasswordResetTokenOrmEntity } from './infrastructure/persistence/password-reset-token.orm-entity';
import { TypeormPasswordResetTokenRepository } from './infrastructure/persistence/typeorm-password-reset-token.repository';
import { RequestPasswordResetUseCase } from './application/use-cases/request-password-reset.usecase';
import { ValidatePasswordTokenUseCase } from './application/use-cases/validate-password-token.usecase';
import { ResetPasswordUseCase } from './application/use-cases/reset-password.usecase';
import { UsersModule } from '../users/users.module';
import { MailModule } from '../mail/mail.module';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PasswordResetTokenOrmEntity, User]),
    ConfigModule,
    UsersModule,
    MailModule,
    AuditModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [PasswordRecoveryController],
  providers: [
    PasswordRecoveryService,
    RequestPasswordResetUseCase,
    ValidatePasswordTokenUseCase,
    ResetPasswordUseCase,
    {
      provide: PasswordResetTokenRepository,
      useClass: TypeormPasswordResetTokenRepository,
    },
  ],
  exports: [PasswordRecoveryService],
})
export class PasswordRecoveryModule {}
