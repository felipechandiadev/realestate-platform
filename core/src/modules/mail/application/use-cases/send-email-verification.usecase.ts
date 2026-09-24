import { Injectable } from '@nestjs/common';
import { MailAdapter } from '../../domain/mail.adapter';
import { DEFAULT_COMPANY_NAME } from '../../brand.constants';

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
      subject: `Verifica tu correo electrónico - ${DEFAULT_COMPANY_NAME}`,
      template: 'email-verification',
      context: {
        firstName,
        verificationLink,
        currentYear: new Date().getFullYear(),
      },
    });
  }
}
