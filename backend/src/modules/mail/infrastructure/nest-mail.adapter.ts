import { Injectable, Logger } from '@nestjs/common';
import { MailAdapter, MailOptions } from '../domain/mail.adapter';
import { MailerService } from '@nestjs-modules/mailer';
import { DataSource, IsNull } from 'typeorm';
import { Identity } from '../../identities/domain/identity.entity';

@Injectable()
export class NestMailAdapter extends MailAdapter {
  private readonly logger = new Logger(NestMailAdapter.name);
  private cachedCompanyName?: string;

  constructor(
    private readonly mailerService: MailerService,
    private readonly dataSource: DataSource,
  ) {
    super();
  }

  private async getCompanyName(): Promise<string> {
    if (this.cachedCompanyName) return this.cachedCompanyName;

    try {
      const identityRepo = this.dataSource.getRepository(Identity);
      const identity = await identityRepo.findOne({ where: { deletedAt: IsNull() }, order: { createdAt: 'DESC' } });
      const name = identity?.name?.trim();
      this.cachedCompanyName = name && name.length ? name : 'EstateFlow';
      return this.cachedCompanyName;
    } catch (error) {
      this.logger.warn('Failed to fetch company name from Identity, falling back to EstateFlow', error?.message);
      return 'EstateFlow';
    }
  }

  async sendMail(options: MailOptions): Promise<void> {
    const companyName = await this.getCompanyName();
    const context = {
      ...(options.context || {}),
      companyName,  // ← El nombre de la BD sobrescribe cualquier otro
    };

    await this.mailerService.sendMail({
      to: options.to,
      subject: options.subject,
      template: options.template,
      context,
    });
  }
}
