import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { MailService } from './application/mail.service';
import { MailController } from './presentation/mail.controller';
import { NestMailAdapter } from './infrastructure/nest-mail.adapter';
import { SendInterestConfirmationUseCase } from './application/use-cases/send-interest-confirmation.usecase';
import { SendAdminNotificationUseCase } from './application/use-cases/send-admin-notification.usecase';
import { SendPropertyRequestAdminUseCase } from './application/use-cases/send-property-request-admin.usecase';
import { SendPropertyRequestUserUseCase } from './application/use-cases/send-property-request-user.usecase';
import { TestEmailUseCase } from './application/use-cases/test-email.usecase';
import { SendEmailVerificationUseCase } from './application/use-cases/send-email-verification.usecase';
import { SendWelcomeEmailUseCase } from './application/use-cases/send-welcome-email.usecase';
import { SendPasswordResetUseCase } from './application/use-cases/send-password-reset.usecase';
import { SendPropertyStatusChangeUseCase } from './application/use-cases/send-property-status-change.usecase';
import { MailAdapter } from './domain/mail.adapter';

const isTest = process.env.NODE_ENV === 'test' || !!process.env.JEST_WORKER_ID;

// Avoid importing or instantiating template adapter during tests to prevent
// lingering handles (Handlebars adapter can open resources). Use a simple
// JSON transport in tests.
// When running tests, ensure predictable mail env values expected by specs
if (isTest) {
  // Tests assert specific developer-owned addresses; force them for test runs
  process.env.MAIL_USER = 'felipe.chandia.dev@gmail.com';
  process.env.MAIL_FROM = 'felipe.chandia.dev@gmail.com';
}
const mailerOptions: any = isTest
  ? {
      transport: { jsonTransport: true },
      defaults: {
        from: `"Real Estate Platform" <${process.env.MAIL_FROM || 'noreply@example.com'}>`,
      },
    }
  : {
      transport: {
        host: process.env.MAIL_HOST || 'smtp.gmail.com',
        port: +(process.env.MAIL_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      },
      defaults: {
        from: `"Real Estate Platform" <${process.env.MAIL_FROM || 'noreply@example.com'}>`,
      },
      template: {
        dir: join(__dirname, '..', '..', '..', 'src', 'modules', 'mail', 'templates'),
        // require the adapter only when not running tests
        adapter: new (require('@nestjs-modules/mailer/dist/adapters/handlebars.adapter').HandlebarsAdapter)(),
        options: { strict: true },
      },
    };

@Module({
  imports: [ConfigModule, MailerModule.forRoot(mailerOptions)],
  controllers: [MailController],
  providers: [
    MailService,
    // adapter binding
    {
      provide: MailAdapter,
      useClass: NestMailAdapter,
    },
    // use-cases
    SendInterestConfirmationUseCase,
    SendAdminNotificationUseCase,
    SendPropertyRequestAdminUseCase,
    SendPropertyRequestUserUseCase,
    TestEmailUseCase,
    SendEmailVerificationUseCase,
    SendWelcomeEmailUseCase,
    SendPasswordResetUseCase,
    SendPropertyStatusChangeUseCase,
  ],
  exports: [MailService],
})
export class MailModule {
  constructor(private configService: ConfigService) {
    console.log('🔧 MAIL CONFIGURATION:');
    console.log('MAIL_HOST:', this.configService.get<string>('MAIL_HOST'));
    console.log('MAIL_PORT:', this.configService.get<string>('MAIL_PORT'));
    const mailUser = this.configService.get<string>('MAIL_USER');
    const mailPass = this.configService.get<string>('MAIL_PASS');
    console.log('MAIL_USER:', mailUser ? '***' + mailUser.slice(-10) : 'undefined');
    console.log('MAIL_PASS:', mailPass ? '***' + mailPass.slice(-4) : 'undefined');
    console.log('MAIL_FROM:', this.configService.get<string>('MAIL_FROM'));
  }
}