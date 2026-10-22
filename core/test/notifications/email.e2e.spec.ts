import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from '../../src/modules/notifications/application/email.service';
import { SendEmailDto } from '../../src/modules/notifications/application/dto/send-email.dto';

/**
 * Uses EmailService's built-in jsonTransport when NODE_ENV/JEST is test.
 * Does not hit real SMTP.
 */
describe('EmailService (test transport)', () => {
  let service: EmailService;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
      ],
      providers: [EmailService],
    }).compile();

    service = moduleRef.get<EmailService>(EmailService);
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  it('sendMail returns a messageId via json transport', async () => {
    const emailDto: SendEmailDto = {
      to: 'test@example.com',
      subject: 'Test Email - EmailService',
      html: '<p>Hello</p>',
    };

    const result = await service.sendMail(emailDto);

    expect(result).toBeDefined();
    expect(result.messageId).toBeDefined();
  });

  it('sendMail with html and text still returns messageId', async () => {
    const emailDto: SendEmailDto = {
      to: 'test@example.com',
      subject: 'Text mail',
      html: '<p>Plain</p>',
      text: 'Plain body',
    };

    const result = await service.sendMail(emailDto);
    expect(result.messageId).toBeDefined();
  });
});
