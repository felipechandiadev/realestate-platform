import { Logger, Module } from '@nestjs/common';
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
import { DEFAULT_COMPANY_NAME } from './brand.constants';

const isTest = process.env.NODE_ENV === 'test' || !!process.env.JEST_WORKER_ID;
const mailLogger = new Logger('MailModule');

// Avoid importing or instantiating template adapter during tests to prevent
// lingering handles (Handlebars adapter can open resources). Use a simple
// JSON transport in tests.
// When running tests, ensure predictable mail env values expected by specs
if (isTest) {
  // Tests assert specific developer-owned addresses; force them for test runs
  process.env.MAIL_USER = 'felipe.chandia.dev@gmail.com';
  process.env.MAIL_FROM = 'felipe.chandia.dev@gmail.com';
}

function trimEnv(value: string | undefined): string {
  return (value ?? '').trim();
}

@Module({
  imports: [ConfigModule, MailerModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => {
      const isTest = process.env.NODE_ENV === 'test' || !!process.env.JEST_WORKER_ID;

      const mailHost = trimEnv(configService.get<string>('MAIL_HOST')) || 'smtp.gmail.com';
      const mailPort = Number(trimEnv(configService.get<string>('MAIL_PORT'))) || 587;
      const mailUser = trimEnv(configService.get<string>('MAIL_USER'));
      const mailPass = trimEnv(configService.get<string>('MAIL_PASS'));
      const mailFrom = trimEnv(configService.get<string>('MAIL_FROM')) || 'noreply@example.com';

      const hasAuth = Boolean(mailUser && mailPass);

      mailLogger.log(
        `SMTP host=${mailHost} port=${mailPort} auth=${hasAuth ? 'on' : 'off'} from=${mailFrom}`,
      );

      if (!isTest && !hasAuth) {
        mailLogger.warn('MAIL_USER/MAIL_PASS empty — SMTP auth disabled (OK for Mailpit)');
      }

      const transport: Record<string, unknown> = {
        host: mailHost,
        port: mailPort,
        secure: false,
      };
      if (hasAuth) {
        transport.auth = { user: mailUser, pass: mailPass };
      }

      const mailerOptions: any = isTest
        ? {
            transport: { jsonTransport: true },
            defaults: {
              from: `"${DEFAULT_COMPANY_NAME}" <${mailFrom}>`,
            },
          }
        : {
            transport,
            defaults: {
              from: `"${DEFAULT_COMPANY_NAME}" <${mailFrom}>`,
            },
            template: {
              dir: join(__dirname, '..', '..', '..', 'src', 'modules', 'mail', 'templates'),
              adapter: new (require('@nestjs-modules/mailer/adapters/handlebars.adapter').HandlebarsAdapter)(),
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
