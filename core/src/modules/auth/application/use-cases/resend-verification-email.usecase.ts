import { Injectable } from '@nestjs/common';
import { UsersService } from '../../../users/application/users.service';
import { MailService } from '../../../mail/application/mail.service';
import { ConfigService } from '@nestjs/config';
import { buildPortalVerifyEmailUrl } from '../../../mail/infrastructure/portal-public-url';

@Injectable()
export class ResendVerificationEmailUseCase {
  constructor(
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  async execute(email: string): Promise<{
    success: boolean;
    message: string;
    error?: string;
  }> {
    try {
      const { token, user } = await this.usersService.resendVerificationEmail(email);

      const verificationLink = buildPortalVerifyEmailUrl(this.configService, token);

      try {
        await this.mailService.sendEmailVerification(
          email,
          user?.personalInfo?.firstName || 'Usuario',
          verificationLink,
        );
      } catch (mailError) {
        console.error('Error sending verification email:', mailError);
      }

      return {
        success: true,
        message: 'Correo de verificación reenviado. Revisa tu bandeja.',
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error al reenviar correo';
      return { success: false, message: errorMessage, error: errorMessage };
    }
  }
}
