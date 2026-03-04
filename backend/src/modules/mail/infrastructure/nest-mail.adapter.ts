import { Injectable } from '@nestjs/common';
import { MailAdapter, MailOptions } from '../domain/mail.adapter';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class NestMailAdapter extends MailAdapter {
  constructor(private readonly mailerService: MailerService) {
    super();
  }

  async sendMail(options: MailOptions): Promise<void> {
    await this.mailerService.sendMail({
      to: options.to,
      subject: options.subject,
      template: options.template,
      context: options.context,
    });
  }
}
