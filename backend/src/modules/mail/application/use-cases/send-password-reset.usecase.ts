import { Injectable } from '@nestjs/common';
import { MailAdapter } from '../../domain/mail.adapter';

@Injectable()
export class SendPasswordResetUseCase {
  constructor(private readonly mailAdapter: MailAdapter) {}

  async execute(
    email: string,
    firstName: string,
    resetLink: string,
    expiresInMinutes: number,
  ): Promise<void> {
    await this.mailAdapter.sendMail({
      to: email,
      subject: 'Restablece tu contraseña - Real Estate Platform',
      template: 'password-reset',
      context: {
        firstName,
        resetLink,
        expiresInMinutes,
        companyName: 'Real Estate Platform',
        currentYear: new Date().getFullYear(),
      },
    });
  }
}
