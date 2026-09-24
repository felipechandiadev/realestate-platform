import { Injectable } from '@nestjs/common';
import { MailAdapter } from '../../domain/mail.adapter';
import { DEFAULT_COMPANY_NAME } from '../../brand.constants';

@Injectable()
export class TestEmailUseCase {
  constructor(private readonly mailAdapter: MailAdapter) {}

  async execute(email: string): Promise<{ success: boolean; message: string }> {
    try {
      await this.mailAdapter.sendMail({
        to: email,
        subject: `Correo de prueba - ${DEFAULT_COMPANY_NAME}`,
        template: 'interest-confirmation',
        context: {
          name: 'Usuario de Prueba',
          propertyTitle: 'Propiedad de Prueba',
          message:
            'Este es un mensaje de prueba para verificar el funcionamiento del sistema de correos.',
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
