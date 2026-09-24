import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailAdapter } from '../../domain/mail.adapter';
import { DEFAULT_COMPANY_NAME } from '../../brand.constants';
import { resolvePortalPublicUrl } from '../../infrastructure/portal-public-url';

@Injectable()
export class SendWelcomeEmailUseCase {
  constructor(
    private readonly mailAdapter: MailAdapter,
    private readonly configService: ConfigService,
  ) {}

  async execute(email: string, firstName: string): Promise<void> {
    const frontendUrl = resolvePortalPublicUrl(this.configService);
    await this.mailAdapter.sendMail({
      to: email,
      subject: `¡Bienvenido a ${DEFAULT_COMPANY_NAME}!`,
      template: 'welcome',
      context: {
        firstName,
        frontendUrl,
        currentYear: new Date().getFullYear(),
      },
    });
  }
}
