import { NotFoundException, BadRequestException } from '@nestjs/common';
import {
  ResendVerificationEmailUseCase,
  RESEND_VERIFICATION_GENERIC_MESSAGE,
} from './resend-verification-email.usecase';

describe('ResendVerificationEmailUseCase', () => {
  const configService = { get: jest.fn().mockReturnValue('http://localhost:8001') } as never;

  const build = (resend: jest.Mock, send = jest.fn().mockResolvedValue(undefined)) => ({
    useCase: new ResendVerificationEmailUseCase(
      { resendVerificationEmail: resend } as never,
      { sendEmailVerification: send } as never,
      configService,
    ),
    send,
  });

  it('responde lo mismo si el usuario no existe y no envía correo', async () => {
    const { useCase, send } = build(jest.fn().mockRejectedValue(new NotFoundException('Usuario no encontrado')));
    await expect(useCase.execute('nadie@x.cl')).resolves.toEqual({
      success: true,
      message: RESEND_VERIFICATION_GENERIC_MESSAGE,
    });
    expect(send).not.toHaveBeenCalled();
  });

  it('responde lo mismo si el correo ya está verificado', async () => {
    const { useCase } = build(jest.fn().mockRejectedValue(new BadRequestException('ya está verificado')));
    await expect(useCase.execute('ok@x.cl')).resolves.toEqual({
      success: true,
      message: RESEND_VERIFICATION_GENERIC_MESSAGE,
    });
  });

  it('envía el correo y responde lo mismo aunque el SMTP falle', async () => {
    const resend = jest.fn().mockResolvedValue({ token: 't', user: { personalInfo: { firstName: 'Ana' } } });
    const send = jest.fn().mockRejectedValue(new Error('SMTP down'));
    const { useCase } = build(resend, send);
    await expect(useCase.execute('ana@x.cl')).resolves.toEqual({
      success: true,
      message: RESEND_VERIFICATION_GENERIC_MESSAGE,
    });
    expect(send).toHaveBeenCalledWith('ana@x.cl', 'Ana', expect.any(String));
  });
});
