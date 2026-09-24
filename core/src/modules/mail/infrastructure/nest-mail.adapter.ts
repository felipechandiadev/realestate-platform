import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailAdapter, MailOptions } from '../domain/mail.adapter';
import { MailerService } from '@nestjs-modules/mailer';
import { DataSource, IsNull } from 'typeorm';
import { Identity } from '../../identities/domain/identity.entity';
import { DEFAULT_COMPANY_NAME } from '../brand.constants';

@Injectable()
export class NestMailAdapter extends MailAdapter {
  private readonly logger = new Logger(NestMailAdapter.name);
  private cachedCompanyName?: string;

  constructor(
    private readonly mailerService: MailerService,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  private async getCompanyName(): Promise<string> {
    if (this.cachedCompanyName) return this.cachedCompanyName;

    try {
      const identityRepo = this.dataSource.getRepository(Identity);
      const identity = await identityRepo.findOne({ where: { deletedAt: IsNull() }, order: { createdAt: 'DESC' } });
      const name = identity?.name?.trim();
      this.cachedCompanyName = name && name.length ? name : DEFAULT_COMPANY_NAME;
      return this.cachedCompanyName;
    } catch (error) {
      this.logger.warn(
        `Failed to fetch company name from Identity, falling back to ${DEFAULT_COMPANY_NAME}`,
        error?.message,
      );
      return DEFAULT_COMPANY_NAME;
    }
  }

  async sendMail(options: MailOptions): Promise<void> {
    const companyName = await this.getCompanyName();
    const mailFrom =
      (this.configService.get<string>('MAIL_FROM') || '').trim() ||
      'noreply@example.com';
    const context = {
      ...(options.context || {}),
      companyName,
    };

    await this.mailerService.sendMail({
      to: options.to,
      subject: options.subject,
      template: options.template,
      context,
      from: `"${companyName}" <${mailFrom}>`,
    });
  }
}
