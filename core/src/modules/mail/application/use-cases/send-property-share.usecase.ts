import { Injectable } from '@nestjs/common';
import { MailAdapter } from '../../domain/mail.adapter';

export type PropertyShareMailInput = {
  to: string;
  propertyTitle: string;
  propertyCode: string;
  propertyLocation: string;
  propertyPriceLabel: string;
  operationLabel: string;
  imageUrl: string;
  note: string;
  senderName: string;
  propertyUrl: string;
};

@Injectable()
export class SendPropertyShareUseCase {
  constructor(private readonly mailAdapter: MailAdapter) {}

  async execute(input: PropertyShareMailInput): Promise<void> {
    const subject = input.senderName
      ? `${input.senderName} te comparte: ${input.propertyTitle}`
      : `Te compartimos: ${input.propertyTitle}`;

    await this.mailAdapter.sendMail({
      to: input.to,
      subject,
      template: 'property-share',
      context: {
        propertyTitle: input.propertyTitle,
        propertyCode: input.propertyCode,
        propertyLocation: input.propertyLocation,
        propertyPriceLabel: input.propertyPriceLabel,
        operationLabel: input.operationLabel,
        imageUrl: input.imageUrl,
        note: input.note,
        senderName: input.senderName,
        propertyUrl: input.propertyUrl,
        currentYear: new Date().getFullYear(),
      },
    });
  }
}
