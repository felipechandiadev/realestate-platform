import { NotificationsService } from './notifications.service';
import { NotificationType } from '../domain/notification.entity';

describe('NotificationsService mail dispatch', () => {
  const build = (mail: Record<string, jest.Mock>) => {
    const userRepository = {
      findOne: jest.fn().mockImplementation(({ where }: { where: { email: string } }) =>
        Promise.resolve({ email: where.email, name: where.email.split('@')[0] }),
      ),
    };
    const service = new NotificationsService(
      {} as never,
      userRepository as never,
      {} as never,
      {} as never,
      mail as never,
      {} as never,
      {} as never,
    );
    jest.spyOn(service as never, 'buildMailContext').mockResolvedValue({
      interestedUserEmail: 'visitante@x.cl',
      interestedUserName: 'Visitante',
      interestedUserPhone: '+56900000000',
      message: 'Texto libre del visitante con un enlace sospechoso',
      propertyTitle: 'Casa',
      agentEmail: 'agente@x.cl',
    } as never);
    jest.spyOn(service as never, 'getAdminEmails').mockResolvedValue(['admin1@x.cl', 'admin2@x.cl'] as never);
    return service;
  };

  const notification = { id: 'n1', type: NotificationType.INTEREST, targetUserIds: ['a1', 'a2'] };

  it('si falla la confirmación al visitante, igual avisa a admins y agente', async () => {
    const mail = {
      sendInterestConfirmation: jest.fn().mockRejectedValue(new Error('correo inválido')),
      sendAdminNotification: jest.fn().mockResolvedValue(undefined),
    };
    const service = build(mail);
    await (service as never as { sendNotificationEmails: (n: unknown, d: unknown) => Promise<void> })
      .sendNotificationEmails(notification, {});
    const recipients = mail.sendAdminNotification.mock.calls.map((c) => c[0]);
    expect(recipients).toEqual(['admin1@x.cl', 'admin2@x.cl', 'agente@x.cl']);
  });

  it('si falla un admin, los siguientes y el agente igual reciben el aviso', async () => {
    const mail = {
      sendInterestConfirmation: jest.fn().mockResolvedValue(undefined),
      sendAdminNotification: jest.fn().mockImplementation((to: string) =>
        to === 'admin1@x.cl' ? Promise.reject(new Error('rebote')) : Promise.resolve(),
      ),
    };
    const service = build(mail);
    await (service as never as { sendNotificationEmails: (n: unknown, d: unknown) => Promise<void> })
      .sendNotificationEmails(notification, {});
    expect(mail.sendAdminNotification.mock.calls.map((c) => c[0])).toEqual([
      'admin1@x.cl',
      'admin2@x.cl',
      'agente@x.cl',
    ]);
  });

  it('la confirmación al visitante no reenvía su mensaje ni su teléfono', async () => {
    const mail = {
      sendInterestConfirmation: jest.fn().mockResolvedValue(undefined),
      sendAdminNotification: jest.fn().mockResolvedValue(undefined),
    };
    const service = build(mail);
    await (service as never as { sendNotificationEmails: (n: unknown, d: unknown) => Promise<void> })
      .sendNotificationEmails(notification, {});
    const [email, , , message, phone] = mail.sendInterestConfirmation.mock.calls[0];
    expect(email).toBe('visitante@x.cl');
    expect(message).toBeUndefined();
    expect(phone).toBeUndefined();
    // Admins y agente sí reciben el mensaje, para poder responder el lead
    expect(mail.sendAdminNotification.mock.calls[0][6]).toContain('Texto libre');
  });
});
