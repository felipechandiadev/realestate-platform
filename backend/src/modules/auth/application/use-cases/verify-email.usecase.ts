import { Injectable } from '@nestjs/common';
import { UsersService } from '../../../users/application/users.service';
import { MailService } from '../../../mail/application/mail.service';

@Injectable()
export class VerifyEmailUseCase {
  constructor(
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
  ) {}

  async execute(token: string): Promise<{
    success: boolean;
    message: string;
    error?: string;
  }> {
    try {
      const user = await this.usersService.verifyUserEmail(token);
      try {
        await this.mailService.sendWelcomeEmail(
          user.email,
          user.personalInfo?.firstName || 'Usuario',
        );
      } catch (mailError) {
        console.error('Error sending welcome email:', mailError);
      }
      return {
        success: true,
        message: 'Correo verificado exitosamente. Ya puedes iniciar sesión.',
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error al verificar correo';
      return { success: false, message: errorMessage, error: errorMessage };
    }
  }
}
