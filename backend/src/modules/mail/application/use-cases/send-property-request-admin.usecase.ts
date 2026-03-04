import { Injectable } from '@nestjs/common';
import { MailAdapter } from '../../domain/mail.adapter';

@Injectable()
export class SendPropertyRequestAdminUseCase {
  constructor(private readonly mailAdapter: MailAdapter) {}

  async execute(
    email: string,
    recipientName: string,
    interestedUserName: string,
    interestedUserEmail: string,
    propertyTitle: string,
    propertyOperation: string,
  ): Promise<void> {
    await this.mailAdapter.sendMail({
      to: email,
      subject: `Nueva solicitud de publicación: ${propertyTitle}`,
      template: 'property-request-admin',
      context: {
        recipientName,
        interestedUserName,
        interestedUserEmail,
        propertyTitle,
        propertyOperation,
        companyName: 'Real Estate Platform',
        currentYear: new Date().getFullYear(),
        platformUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
      },
    });
  }
}
