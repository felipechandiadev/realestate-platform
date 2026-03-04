import { Injectable } from '@nestjs/common';
import { MailAdapter } from '../../domain/mail.adapter';

@Injectable()
export class SendAdminNotificationUseCase {
  constructor(private readonly mailAdapter: MailAdapter) {}

  async execute(
    email: string,
    recipientName: string,
    interestedUserName: string,
    interestedUserEmail: string,
    interestedUserPhone: string | undefined,
    propertyTitle: string,
    message: string,
  ): Promise<void> {
    await this.mailAdapter.sendMail({
      to: email,
      subject: `Nuevo interés en propiedad: ${propertyTitle}`,
      template: 'admin-notification',
      context: {
        recipientName,
        interestedUserName,
        interestedUserEmail,
        interestedUserPhone,
        propertyTitle,
        message,
        companyName: 'Real Estate Platform',
        currentYear: new Date().getFullYear(),
      },
    });
  }
}
