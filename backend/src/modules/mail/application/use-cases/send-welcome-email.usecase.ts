import { Injectable } from '@nestjs/common';
import { MailAdapter } from '../../domain/mail.adapter';

@Injectable()
export class SendWelcomeEmailUseCase {
  constructor(private readonly mailAdapter: MailAdapter) {}

  async execute(email: string, firstName: string): Promise<void> {
    await this.mailAdapter.sendMail({
      to: email,
      subject: '¡Bienvenido a Real Estate Platform!',
      template: 'welcome',
      context: {
        firstName,
        companyName: 'Real Estate Platform',
        currentYear: new Date().getFullYear(),
      },
    });
  }
}
