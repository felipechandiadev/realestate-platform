import { Injectable } from '@nestjs/common';
import { SendInterestConfirmationUseCase } from './use-cases/send-interest-confirmation.usecase';
import { SendAdminNotificationUseCase } from './use-cases/send-admin-notification.usecase';
import { SendPropertyRequestAdminUseCase } from './use-cases/send-property-request-admin.usecase';
import { SendPropertyRequestUserUseCase } from './use-cases/send-property-request-user.usecase';
import { TestEmailUseCase } from './use-cases/test-email.usecase';
import { SendEmailVerificationUseCase } from './use-cases/send-email-verification.usecase';
import { SendWelcomeEmailUseCase } from './use-cases/send-welcome-email.usecase';
import { SendPasswordResetUseCase } from './use-cases/send-password-reset.usecase';
import { SendPropertyStatusChangeUseCase } from './use-cases/send-property-status-change.usecase';

export interface MailTemplateContext {
  name?: string;
  propertyTitle?: string;
  companyName?: string;
  contactEmail?: string;
  message?: string;
  agentName?: string;
  propertyId?: string;
  [key: string]: any;
}

@Injectable()
export class MailService {
  constructor(
    private readonly sendInterestConfirmationUseCase: SendInterestConfirmationUseCase,
    private readonly sendAdminNotificationUseCase: SendAdminNotificationUseCase,
    private readonly sendPropertyRequestAdminUseCase: SendPropertyRequestAdminUseCase,
    private readonly sendPropertyRequestUserUseCase: SendPropertyRequestUserUseCase,
    private readonly testEmailUseCase: TestEmailUseCase,
    private readonly sendEmailVerificationUseCase: SendEmailVerificationUseCase,
    private readonly sendWelcomeEmailUseCase: SendWelcomeEmailUseCase,
    private readonly sendPasswordResetUseCase: SendPasswordResetUseCase,
    private readonly sendPropertyStatusChangeUseCase: SendPropertyStatusChangeUseCase,
  ) {}

  /**
   * Envía correo de confirmación de interés en propiedad
   */
  async sendInterestConfirmation(
    email: string,
    name: string,
    propertyTitle: string,
    message?: string,
    contactPhone?: string,
    propertyCode?: string,
    propertyPrice?: number,
    propertyLocation?: string,
    agentName?: string,
  ): Promise<void> {
    return this.sendInterestConfirmationUseCase.execute(
      email,
      name,
      propertyTitle,
      message,
      contactPhone,
      propertyCode,
      propertyPrice,
      propertyLocation,
      agentName,
    );
  }

  /**
   * Envía notificación a administrador/agente sobre nuevo interés
   */
  async sendAdminNotification(
    email: string,
    recipientName: string,
    interestedUserName: string,
    interestedUserEmail: string,
    interestedUserPhone: string | undefined,
    propertyTitle: string,
    message: string
  ): Promise<void> {
    return this.sendAdminNotificationUseCase.execute(
      email,
      recipientName,
      interestedUserName,
      interestedUserEmail,
      interestedUserPhone,
      propertyTitle,
      message,
    );
  }

  /**
   * Envía notificación a administrador sobre nueva solicitud de publicación
   */
  async sendPropertyRequestAdminNotification(
    email: string,
    recipientName: string,
    interestedUserName: string,
    interestedUserEmail: string,
    propertyTitle: string,
    propertyOperation: string
  ): Promise<void> {
    return this.sendPropertyRequestAdminUseCase.execute(
      email,
      recipientName,
      interestedUserName,
      interestedUserEmail,
      propertyTitle,
      propertyOperation,
    );
  }

  /**
   * Envía confirmación al usuario sobre su solicitud de publicación
   */
  async sendPropertyRequestUserConfirmation(
    email: string,
    name: string,
    propertyTitle: string
  ): Promise<void> {
    return this.sendPropertyRequestUserUseCase.execute(email, name, propertyTitle);
  }

  /**
   * Método de prueba para verificar envío de correos (SOLO DESARROLLO)
   */
  async testEmail(email: string): Promise<{ success: boolean; message: string }> {
    return this.testEmailUseCase.execute(email);
  }

  /**
   * Envía correo de verificación de email para nuevos usuarios
   */
  async sendEmailVerification(
    email: string,
    firstName: string,
    verificationLink: string,
  ): Promise<void> {
    return this.sendEmailVerificationUseCase.execute(email, firstName, verificationLink);
  }

  /**
   * Envía correo de bienvenida tras verificar email
   */
  async sendWelcomeEmail(
    email: string,
    firstName: string,
  ): Promise<void> {
    return this.sendWelcomeEmailUseCase.execute(email, firstName);
  }

  /**
   * Envía instrucciones para restablecer contraseña
   */
  async sendPasswordReset(
    email: string,
    firstName: string,
    resetLink: string,
    expiresInMinutes: number,
  ): Promise<void> {
    return this.sendPasswordResetUseCase.execute(email, firstName, resetLink, expiresInMinutes);
  }

  /**
   * Envía notificación de cambio de estado de propiedad
   */
  async sendPropertyStatusChangeNotification(
    email: string,
    name: string,
    propertyTitle: string,
    newStatus: string
  ): Promise<void> {
    return this.sendPropertyStatusChangeUseCase.execute(email, name, propertyTitle, newStatus);
  }
}