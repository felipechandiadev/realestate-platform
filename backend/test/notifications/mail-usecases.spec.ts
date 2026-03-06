import { SendWelcomeEmailUseCase } from '../../src/modules/mail/application/use-cases/send-welcome-email.usecase';
import { SendPasswordResetUseCase } from '../../src/modules/mail/application/use-cases/send-password-reset.usecase';
import { SendInterestConfirmationUseCase } from '../../src/modules/mail/application/use-cases/send-interest-confirmation.usecase';
import { SendPropertyStatusChangeUseCase } from '../../src/modules/mail/application/use-cases/send-property-status-change.usecase';
import { SendPropertyRequestUserUseCase } from '../../src/modules/mail/application/use-cases/send-property-request-user.usecase';
import { SendPropertyRequestAdminUseCase } from '../../src/modules/mail/application/use-cases/send-property-request-admin.usecase';
import { SendEmailVerificationUseCase } from '../../src/modules/mail/application/use-cases/send-email-verification.usecase';

const createMailAdapterMock = () => ({
  sendMail: jest.fn().mockResolvedValue(undefined),
});

describe('Mail use case unit tests', () => {
  it('SendWelcomeEmailUseCase calls mailAdapter with welcome template', async () => {
    const mailAdapter = createMailAdapterMock();
    const useCase = new SendWelcomeEmailUseCase(mailAdapter as any);

    await useCase.execute('user@example.com', 'Felipe');

    expect(mailAdapter.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        subject: expect.stringContaining('Bienvenido'),
        template: 'welcome',
        context: expect.objectContaining({
          firstName: 'Felipe',
          companyName: expect.any(String),
        }),
      }),
    );
  });

  it('SendPasswordResetUseCase calls mailAdapter with password-reset template', async () => {
    const mailAdapter = createMailAdapterMock();
    const useCase = new SendPasswordResetUseCase(mailAdapter as any);

    await useCase.execute('user@example.com', 'Felipe', 'https://reset.link', 30);

    expect(mailAdapter.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        subject: expect.stringContaining('Restablece tu contraseña'),
        template: 'password-reset',
        context: expect.objectContaining({
          firstName: 'Felipe',
          resetLink: 'https://reset.link',
          expiresInMinutes: 30,
        }),
      }),
    );
  });

  it('SendInterestConfirmationUseCase calls mailAdapter with interest-confirmation template', async () => {
    const mailAdapter = createMailAdapterMock();
    const useCase = new SendInterestConfirmationUseCase(mailAdapter as any);

    await useCase.execute(
      'user@example.com',
      'Felipe',
      'Casa en la playa',
      'Me interesa',
      '+56912345678',
    );

    expect(mailAdapter.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        template: 'interest-confirmation',
        context: expect.objectContaining({
          name: 'Felipe',
          propertyTitle: 'Casa en la playa',
          message: 'Me interesa',
          contactPhone: '+56912345678',
        }),
      }),
    );
  });

  it('SendPropertyStatusChangeUseCase calls mailAdapter with property-status-change template', async () => {
    const mailAdapter = createMailAdapterMock();
    const useCase = new SendPropertyStatusChangeUseCase(mailAdapter as any);

    await useCase.execute('user@example.com', 'Felipe', 'Casa en la playa', 'Publicado');

    expect(mailAdapter.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        template: 'property-status-change',
        context: expect.objectContaining({
          name: 'Felipe',
          propertyTitle: 'Casa en la playa',
          newStatus: 'Publicado',
        }),
      }),
    );
  });

  it('SendPropertyRequestUserUseCase calls mailAdapter with property-request-user template', async () => {
    const mailAdapter = createMailAdapterMock();
    const useCase = new SendPropertyRequestUserUseCase(mailAdapter as any);

    await useCase.execute('user@example.com', 'Felipe', 'Casa en la playa');

    expect(mailAdapter.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        template: 'property-request-user',
        context: expect.objectContaining({
          name: 'Felipe',
          propertyTitle: 'Casa en la playa',
        }),
      }),
    );
  });

  it('SendPropertyRequestAdminUseCase calls mailAdapter with property-request-admin template', async () => {
    const mailAdapter = createMailAdapterMock();
    const useCase = new SendPropertyRequestAdminUseCase(mailAdapter as any);

    await useCase.execute(
      'admin@example.com',
      'Admin',
      'Felipe',
      'user@example.com',
      'Casa en la playa',
      'Venta',
    );

    expect(mailAdapter.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'admin@example.com',
        template: 'property-request-admin',
        context: expect.objectContaining({
          recipientName: 'Admin',
          interestedUserName: 'Felipe',
          interestedUserEmail: 'user@example.com',
          propertyTitle: 'Casa en la playa',
          propertyOperation: 'Venta',
        }),
      }),
    );
  });

  it('SendEmailVerificationUseCase calls mailAdapter with email-verification template', async () => {
    const mailAdapter = createMailAdapterMock();
    const useCase = new SendEmailVerificationUseCase(mailAdapter as any);

    await useCase.execute('user@example.com', 'Felipe', 'https://verify.link');

    expect(mailAdapter.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        template: 'email-verification',
        context: expect.objectContaining({
          firstName: 'Felipe',
          verificationLink: 'https://verify.link',
        }),
      }),
    );
  });
});
