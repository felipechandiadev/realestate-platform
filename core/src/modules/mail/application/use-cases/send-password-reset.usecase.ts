import { Injectable } from '@nestjs/common';
import { MailAdapter } from '../../domain/mail.adapter';
import { DEFAULT_COMPANY_NAME } from '../../brand.constants';

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
      subject: `Restablece tu contraseña - ${DEFAULT_COMPANY_NAME}`,
      template: 'password-reset',
      context: {
        firstName,
        resetLink,
        expiresInMinutes,
        currentYear: new Date().getFullYear(),
      },
    });
  }
}
