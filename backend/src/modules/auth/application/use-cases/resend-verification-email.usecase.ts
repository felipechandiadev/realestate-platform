import { Injectable } from '@nestjs/common';
import { UsersService } from '../../../users/application/users.service';
import { MailService } from '../../../mail/application/mail.service';
import { ConfigService } from '@nestjs/config';

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

      let frontendUrl = this.configService.get<string>('FRONTEND_PUBLIC_URL');
      if (!frontendUrl) {
        const backendUrl = this.configService.get<string>('BACKEND_PUBLIC_URL');
        if (backendUrl) {
          frontendUrl = backendUrl.replace(':3000', ':3001');
        } else {
          frontendUrl = 'http://localhost:3001';
        }
      }
      const verificationLink = `${frontendUrl}/portal/verify-email?token=${token}`;

      try {
        // El usersService.resendVerificationEmail ya generó el token,
        // ahora solo intentamos enviar el email. Si falla, lo capturamos
        // pero seguimos adelante con la respuesta exitosa
        await this.mailService.sendEmailVerification(
          email,
          user?.personalInfo?.firstName || 'Usuario', // Usar nombre real del usuario
          verificationLink,
        );
      } catch (mailError) {
        console.error('Error sending verification email:', mailError);
        // No lanzamos el error aquí para permitir que el flujo continúe
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
