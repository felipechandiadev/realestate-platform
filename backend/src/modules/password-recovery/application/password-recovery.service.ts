import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { User } from '../../users/domain/user.entity';
import { PasswordResetToken } from '../domain/password-reset-token.entity';
import { PasswordResetTokenRepository } from '../domain/password-reset-token.repository';
import { randomBytes } from 'crypto';
import { MailService } from '../../mail/application/mail.service';
import { ConfigService } from '@nestjs/config';
import { AuditService } from '../../audit/application/audit.service';
import { RequestPasswordResetUseCase } from './use-cases/request-password-reset.usecase';
import { ValidatePasswordTokenUseCase } from './use-cases/validate-password-token.usecase';
import { ResetPasswordUseCase } from './use-cases/reset-password.usecase';
import { AuditAction, AuditEntityType } from '../../../shared/enums/audit.enums';

export interface ValidateTokenResult {
  valid: boolean;
  emailHint: string;
  expiresAt: string;
}

@Injectable()
export class PasswordRecoveryService {
  constructor(
    private readonly passwordResetTokenRepository: PasswordResetTokenRepository,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    @Inject(AuditService)
    private readonly auditService: AuditService,
    private readonly requestPasswordReset: RequestPasswordResetUseCase,
    private readonly validatePasswordToken: ValidatePasswordTokenUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
  ) {}

  async requestReset(
    email: string,
    options: { ipAddress?: string; userAgent?: string } = {},
  ): Promise<void> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.userRepository.findOne({
      where: { email: normalizedEmail },
    });

    const expiresInMinutes = this.getTokenTtlMinutes();

    if (!user) {
      await this.auditService.createAuditLog({
        action: AuditAction.PASSWORD_RESET_REQUESTED,
        entityType: AuditEntityType.USER,
        description: 'Solicitud de recuperación de contraseña para email no asociado a usuario',
        metadata: { email: normalizedEmail },
        success: true,
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
      });
      return;
    }

    // delegate token creation to use case
    const createdToken = await this.requestPasswordReset.execute(
      user,
      expiresInMinutes,
      options,
    );

    const resetUrl = this.buildResetUrl(createdToken.token);

    await this.mailService.sendPasswordReset(
      user.email,
      user.personalInfo?.firstName || user.name || 'Usuario',
      resetUrl,
      expiresInMinutes,
    );

    await this.auditService.createAuditLog({
      userId: user.id,
      action: AuditAction.PASSWORD_RESET_REQUESTED,
      entityType: AuditEntityType.USER,
      entityId: createdToken.id,
      description: 'Token de recuperación de contraseña generado y enviado',
      metadata: {
        expiresAt: createdToken.expiresAt,
        tokenSuffix: createdToken.token.slice(-6),
      },
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
      success: true,
    });
  }

  async validateToken(token: string): Promise<ValidateTokenResult> {
    const tokenRecord = await this.validatePasswordToken.execute(token);

    if (!tokenRecord || tokenRecord.consumedAt) {
      throw new BadRequestException('El enlace de recuperación no es válido. Solicita uno nuevo.');
    }

    if (tokenRecord.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('El enlace de recuperación ha expirado. Solicita uno nuevo.');
    }

    // fetch user email separately
    const tokenUser = await this.userRepository.findOne({ where: { id: tokenRecord.userId } });
    return {
      valid: true,
      emailHint: tokenUser ? this.maskEmail(tokenUser.email) : '',
      expiresAt: tokenRecord.expiresAt.toISOString(),
    };
  }

  async resetPassword(token: string, password: string): Promise<{ email: string }> {
    const tokenRecord = await this.validatePasswordToken.execute(token);

    if (!tokenRecord || tokenRecord.consumedAt) {
      throw new BadRequestException('El enlace de recuperación no es válido. Solicita uno nuevo.');
    }

    if (tokenRecord.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('El enlace de recuperación ha expirado. Solicita uno nuevo.');
    }

    const result = await this.resetPasswordUseCase.execute(tokenRecord, password);

    await this.auditService.createAuditLog({
      userId: tokenRecord.userId,
      action: AuditAction.PASSWORD_RESET_COMPLETED,
      entityType: AuditEntityType.USER,
      entityId: tokenRecord.userId,
      description: 'Contraseña restablecida mediante flujo de recuperación',
      metadata: { tokenId: tokenRecord.id, tokenSuffix: token.slice(-6) },
      success: true,
    });

    return result;
  }

  private getTokenTtlMinutes(): number {
    const raw = this.configService.get<string>('PASSWORD_RESET_TOKEN_TTL');
    const parsed = raw ? parseInt(raw, 10) : NaN;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 30;
  }

  private buildResetUrl(token: string): string {
    const frontendBaseUrl =
      this.configService.get<string>('FRONTEND_PUBLIC_URL')?.replace(/\/$/, '') ||
      this.deriveFrontendUrlFromBackend();

    return `${frontendBaseUrl}/portal/reset-password?token=${token}`;
  }

  private deriveFrontendUrlFromBackend(): string {
    const backendUrl = this.configService.get<string>('BACKEND_PUBLIC_URL');
    if (backendUrl) {
      return backendUrl.replace(':3000', ':3001').replace(/\/$/, '');
    }
    return 'http://localhost:3001';
  }

  private maskEmail(email: string): string {
    const [userPart, domainPart] = email.split('@');
    if (!domainPart) {
      return email;
    }

    const visibleChars = Math.min(2, userPart.length);
    const maskedUser = `${userPart.slice(0, visibleChars)}${'*'.repeat(
      Math.max(userPart.length - visibleChars, 1),
    )}`;

    return `${maskedUser}@${domainPart}`;
  }
}
