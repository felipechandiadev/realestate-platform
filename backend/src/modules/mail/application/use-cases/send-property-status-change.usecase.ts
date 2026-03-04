import { Injectable } from '@nestjs/common';
import { MailAdapter } from '../../domain/mail.adapter';

@Injectable()
export class SendPropertyStatusChangeUseCase {
  constructor(private readonly mailAdapter: MailAdapter) {}

  async execute(
    email: string,
    name: string,
    propertyTitle: string,
    newStatus: string,
  ): Promise<void> {
    await this.mailAdapter.sendMail({
      to: email,
      subject: `Actualización de tu propiedad: ${propertyTitle}`,
      template: 'property-status-change',
      context: {
        name,
        propertyTitle,
        newStatus,
        companyName: 'Real Estate Platform',
        currentYear: new Date().getFullYear(),
      },
    });
  }
}
