import { NotificationsGateway } from './notifications.gateway';
import { JweService } from '../../auth/infrastructure/jwe/jwe.service';

describe('NotificationsGateway', () => {
  let gateway: NotificationsGateway;
  let jweService: jest.Mocked<Pick<JweService, 'decrypt'>>;

  beforeEach(() => {
    jweService = { decrypt: jest.fn() };
    gateway = new NotificationsGateway(jweService as unknown as JweService);
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
