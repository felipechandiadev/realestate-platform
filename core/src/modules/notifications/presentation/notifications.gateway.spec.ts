import { NotificationsGateway } from './notifications.gateway';
import { JweService } from '../../auth/infrastructure/jwe/jwe.service';
import { SessionUserService } from '../../auth/application/session-user.service';

describe('NotificationsGateway', () => {
  let gateway: NotificationsGateway;
  let jweService: jest.Mocked<Pick<JweService, 'decrypt'>>;
  let sessionUsers: { assertActive: jest.Mock };

  beforeEach(() => {
    jweService = { decrypt: jest.fn() };
    sessionUsers = { assertActive: jest.fn().mockResolvedValue('ADMIN') };
    gateway = new NotificationsGateway(
      jweService as unknown as JweService,
      sessionUsers as unknown as SessionUserService,
    );
  });

  it('desconecta a una cuenta desactivada aunque su token siga vigente', async () => {
    jweService.decrypt.mockResolvedValue({ sub: 'user-9', role: 'AGENT', authAudience: 'staff' });
    sessionUsers.assertActive.mockRejectedValue(new Error('Tu cuenta está inactiva'));
    const socket = {
      handshake: { auth: { token: 'verified-token' } },
      data: {},
      join: jest.fn(),
      disconnect: jest.fn(),
    } as any;

    await gateway.handleConnection(socket);

    expect(sessionUsers.assertActive).toHaveBeenCalledWith('user-9');
    expect(socket.disconnect).toHaveBeenCalledWith(true);
    expect(socket.join).not.toHaveBeenCalled();
  });

  it('joins only the authenticated token subject room', async () => {
    jweService.decrypt.mockResolvedValue({ sub: 'user-123', role: 'ADMIN', authAudience: 'staff' });
    const socket = {
      handshake: { auth: { token: 'verified-token' } },
      data: {},
      join: jest.fn(),
      disconnect: jest.fn(),
    } as any;

    await gateway.handleConnection(socket);

    expect(socket.data.userId).toBe('user-123');
    expect(socket.join).toHaveBeenCalledWith('user:user-123');
    expect(socket.disconnect).not.toHaveBeenCalled();
  });

  it('disconnects without a token', async () => {
    const socket = {
      handshake: { auth: {} },
      data: {},
      join: jest.fn(),
      disconnect: jest.fn(),
    } as any;

    await gateway.handleConnection(socket);

    expect(socket.disconnect).toHaveBeenCalledWith(true);
    expect(socket.join).not.toHaveBeenCalled();
  });

  it('does not join a room when token verification fails', async () => {
    jweService.decrypt.mockRejectedValue(new Error('invalid token'));
    const socket = {
      handshake: { auth: { token: 'bad-token' } },
      data: {},
      join: jest.fn(),
      disconnect: jest.fn(),
    } as any;

    await gateway.handleConnection(socket);

    expect(socket.disconnect).toHaveBeenCalledWith(true);
    expect(socket.join).not.toHaveBeenCalled();
  });
});
