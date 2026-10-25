import { PasswordRecoveryService } from './password-recovery.service';

describe('PasswordRecoveryService.requestReset', () => {
  const build = (user: unknown, sendPasswordReset: jest.Mock) => {
    const audit = { createAuditLog: jest.fn().mockResolvedValue(undefined) };
    const service = new PasswordRecoveryService(
      {} as never,
      { findOne: jest.fn().mockResolvedValue(user) } as never,
      { sendPasswordReset } as never,
      { get: jest.fn().mockReturnValue(undefined) } as never,
      audit as never,
      { execute: jest.fn().mockResolvedValue({ id: 'tok', token: 'abcdef123456', expiresAt: new Date() }) } as never,
      {} as never,
      {} as never,
    );
    return { service, audit };
  };

  it('no propaga errores SMTP para usuarios existentes (sin fuga por 500)', async () => {
    const send = jest.fn().mockRejectedValue(new Error('SMTP down'));
    const { service, audit } = build({ id: 'u1', email: 'a@x.cl', personalInfo: { firstName: 'A' } }, send);
    await expect(service.requestReset('a@x.cl')).resolves.toBeUndefined();
    expect(send).toHaveBeenCalled();
    expect(audit.createAuditLog).toHaveBeenCalled();
  });

  it('no envía correo si el usuario no existe', async () => {
    const send = jest.fn();
    const { service } = build(null, send);
    await expect(service.requestReset('nadie@x.cl')).resolves.toBeUndefined();
    expect(send).not.toHaveBeenCalled();
  });
});
