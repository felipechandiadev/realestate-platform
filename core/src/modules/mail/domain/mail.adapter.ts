export interface MailOptions {
  to: string;
  subject: string;
  template: string;
  context?: any;
}

export abstract class MailAdapter {
  abstract sendMail(options: MailOptions): Promise<void>;
}
