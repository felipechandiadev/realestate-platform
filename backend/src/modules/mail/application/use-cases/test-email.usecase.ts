import { Injectable } from '@nestjs/common';
import { MailAdapter } from '../../domain/mail.adapter';

@Injectable()
export class TestEmailUseCase {
  constructor(private readonly mailAdapter: MailAdapter) {}

  async execute(email: string): Promise<{ success: boolean; message: string }> {
    try {
      await this.mailAdapter.sendMail({
        to: email,
        subject: 'Test Email - Real Estate Platform',
        template: 'interest-confirmation',
        context: {
          name: 'Usuario de Prueba',
          propertyTitle: 'Propiedad de Prueba',
          message: 'Este es un mensaje de prueba para verificar el funcionamiento del sistema de correos.',
          companyName: 'Real Estate Platform',
          contactEmail: process.env.MAIL_FROM,
          currentYear: new Date().getFullYear(),
        },
      });
      return { success: true, message: `Correo enviado exitosamente a ${email}` };
    } catch (error) {
      return { success: false, message: `Error enviando correo: ${error.message}` };
    }
  }
}
