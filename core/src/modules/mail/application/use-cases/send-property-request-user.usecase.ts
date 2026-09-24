import { Injectable } from '@nestjs/common';
import { MailAdapter } from '../../domain/mail.adapter';

@Injectable()
export class SendPropertyRequestUserUseCase {
  constructor(private readonly mailAdapter: MailAdapter) {}

  async execute(
    email: string,
    name: string,
    propertyTitle: string,
  ): Promise<void> {
    await this.mailAdapter.sendMail({
      to: email,
      subject: 'Hemos recibido tu solicitud de publicación',
      template: 'property-request-user',
      context: {
        name,
        propertyTitle,
        currentYear: new Date().getFullYear(),
      },
    });
  }
}
