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
    propertyCode?: string,
    propertyPrice?: number,
    propertyLocation?: string,
    agentName?: string,
  ): Promise<void> {
    await this.mailAdapter.sendMail({
      to: email,
      subject: `Hemos recibido tu interés en ${propertyTitle}`,
      template: 'interest-confirmation',
      context: {
        name,
        propertyTitle,
        propertyCode,
        propertyPrice,
        propertyLocation,
        agentName,
        message,
        contactPhone,
        companyName: 'Real Estate Platform',
        contactEmail: process.env.MAIL_FROM,
        currentYear: new Date().getFullYear(),
      },
    });
  }
}
