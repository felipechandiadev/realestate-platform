import { Injectable } from '@nestjs/common';
import { MailAdapter } from '../../domain/mail.adapter';

@Injectable()
export class SendEmailVerificationUseCase {
  constructor(private readonly mailAdapter: MailAdapter) {}

  async execute(
    email: string,
    firstName: string,
    verificationLink: string,
  ): Promise<void> {
    await this.mailAdapter.sendMail({
      to: email,
      subject: 'Verifica tu correo electrónico - Real Estate Platform',
      template: 'email-verification',
      context: {
        firstName,
        verificationLink,
        companyName: 'Real Estate Platform',
        currentYear: new Date().getFullYear(),
      },
    });
  }
}
