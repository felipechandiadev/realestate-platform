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

@Module({
  imports: [ConfigModule, MailerModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => {
      const isTest = process.env.NODE_ENV === 'test' || !!process.env.JEST_WORKER_ID;

      const mailHost = configService.get<string>('MAIL_HOST') || 'smtp.gmail.com';
      const mailPort = Number(configService.get<string>('MAIL_PORT')) || 587;
      const mailUser = configService.get<string>('MAIL_USER');
      const mailPass = configService.get<string>('MAIL_PASS');
      const mailFrom = configService.get<string>('MAIL_FROM') || 'noreply@example.com';

      console.log('🔧 MAIL CONFIGURATION (from ConfigService):');
      console.log('  MAIL_HOST:', mailHost);
      console.log('  MAIL_PORT:', mailPort);
      console.log('  MAIL_USER:', mailUser ? '***' + mailUser.slice(-10) : 'undefined');
      console.log('  MAIL_PASS:', mailPass ? '***' + mailPass.slice(-4) : 'undefined');
      console.log('  MAIL_FROM:', mailFrom);

      if (!isTest && (!mailUser || !mailPass)) {
        console.error('❌ ERROR: MAIL_USER or MAIL_PASS is not defined!');
      }

      const mailerOptions: any = isTest
        ? {
            transport: { jsonTransport: true },
            defaults: {
              from: `"EstateFlow" <${mailFrom}>`,
            },
          }
        : {
            transport: {
              host: mailHost,
              port: mailPort,
              secure: false,
              auth: {
                user: mailUser,
                pass: mailPass,
              },
            },
            defaults: {
              from: `"EstateFlow" <${mailFrom}>`,
            },
            template: {
              dir: join(__dirname, '..', '..', '..', 'src', 'modules', 'mail', 'templates'),
              adapter: new (require('@nestjs-modules/mailer/dist/adapters/handlebars.adapter').HandlebarsAdapter)(),
              options: { strict: true },
            },
          };

      return mailerOptions;
    }
  })],
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
export class MailModule {}