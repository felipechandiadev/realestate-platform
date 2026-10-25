import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../../../users/application/users.service';
import { MailService } from '../../../mail/application/mail.service';
import { ConfigService } from '@nestjs/config';
import { buildPortalVerifyEmailUrl } from '../../../mail/infrastructure/portal-public-url';

/** Respuesta única para no revelar si el correo existe o ya está verificado. */
export const RESEND_VERIFICATION_GENERIC_MESSAGE =
  'Si el correo corresponde a una cuenta pendiente de verificación, te enviaremos un nuevo enlace.';

@Injectable()
export class ResendVerificationEmailUseCase {
  private readonly logger = new Logger(ResendVerificationEmailUseCase.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  async execute(email: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const { token, user } = await this.usersService.resendVerificationEmail(email);
      const verificationLink = buildPortalVerifyEmailUrl(this.configService, token);

      // En segundo plano: el tiempo de respuesta no debe delatar si la cuenta existe.
      void this.mailService
        .sendEmailVerification(email, user?.personalInfo?.firstName || 'Usuario', verificationLink)
        .catch((mailError: unknown) => {
          this.logger.error(
            'Error sending verification email',
            mailError instanceof Error ? mailError.stack : String(mailError),
          );
        });
    } catch (error) {
      // Usuario inexistente o ya verificado: se registra, pero la respuesta es la misma.
      this.logger.debug(
        `Resend verification skipped: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    return { success: true, message: RESEND_VERIFICATION_GENERIC_MESSAGE };
  }
}
