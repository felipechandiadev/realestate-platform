import { Injectable } from '@nestjs/common';
import { MailAdapter } from '../../domain/mail.adapter';

@Injectable()
export class SendInterestConfirmationUseCase {
  constructor(private readonly mailAdapter: MailAdapter) {}

  async execute(
    email: string,
    name: string,
    propertyTitle: string,
    message?: string,
    contactPhone?: string,
  ): Promise<void> {
    await this.mailAdapter.sendMail({
      to: email,
      subject: 'Hemos recibido tu interés en la propiedad',
      template: 'interest-confirmation',
      context: {
        name,
        propertyTitle,
        message,
        contactPhone,
        companyName: 'Real Estate Platform',
        contactEmail: process.env.MAIL_FROM,
        currentYear: new Date().getFullYear(),
      },
    });
  }
}
