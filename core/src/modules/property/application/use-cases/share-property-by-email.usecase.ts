import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailService } from '../../../mail/application/mail.service';
import { resolvePortalPublicUrl } from '../../../mail/infrastructure/portal-public-url';
import { User } from '../../../users/domain/user.entity';
import { PropertyStatus } from '../../../../shared/enums/property-status.enum';
import { PropertyOperationType } from '../../../../shared/enums/property-operation-type.enum';
import { MultimediaFormat, MultimediaType } from '../../../multimedia/domain/multimedia.entity';
import { FindOnePropertyUseCase } from './find-one-property.usecase';
import { SharePropertyDto } from '../../dto/share-property.dto';

const VIDEO_URL = /\.(mp4|webm|ogg|mov)(\?|#|$)/i;

@Injectable()
export class SharePropertyByEmailUseCase {
  constructor(
    private readonly findOnePropertyUseCase: FindOnePropertyUseCase,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  async execute(propertyId: string, dto: SharePropertyDto, senderUserId: string): Promise<{ success: true }> {
    const property = await this.findOnePropertyUseCase.execute(propertyId);
    if (property.status !== PropertyStatus.PUBLISHED) {
      throw new BadRequestException('Solo se puede enviar por correo una propiedad publicada');
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(senderUserId);
    const sender = isUuid
      ? await this.userRepository.findOne({ where: { id: senderUserId } })
      : null;
    const senderName = this.senderName(sender);
    const imageUrl = this.firstImageUrl(property.mainImageUrl, property.multimedia);
    const origin = resolvePortalPublicUrl(this.configService);

    await this.mailService.sendPropertyShare({
      to: dto.to.trim(),
      propertyTitle: property.title,
      propertyCode: property.code || '',
      propertyLocation: [property.city, property.state].filter(Boolean).join(', '),
      propertyPriceLabel: this.formatPrice(property.price, property.currencyPrice),
      operationLabel: property.operationType === PropertyOperationType.RENT ? 'Arriendo' : 'Venta',
      imageUrl,
      note: dto.note?.trim() || '',
      senderName,
      propertyUrl: `${origin}/properties/property/${property.id}`,
    });

    return { success: true };
  }

  private senderName(user: User | null): string {
    const info = user?.personalInfo;
    const full = [info?.firstName, info?.lastName].filter(Boolean).join(' ').trim();
    return full || user?.username || user?.email || '';
  }

  private formatPrice(price: number, currency: string): string {
    if (currency === 'UF') {
      return `${new Intl.NumberFormat('es-CL', { maximumFractionDigits: 2 }).format(price)} UF`;
    }
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(price || 0);
  }

  private firstImageUrl(
    mainImageUrl: string | undefined,
    multimedia: { url: string; format: MultimediaFormat; type: MultimediaType }[] | undefined,
  ): string {
    if (mainImageUrl && !VIDEO_URL.test(mainImageUrl)) return mainImageUrl;
    const image = (multimedia || []).find((item) => {
      if (item.format === MultimediaFormat.VIDEO || item.format === MultimediaFormat.DOCUMENT) return false;
      if (item.type === MultimediaType.PROPERTY_VIDEO) return false;
      return Boolean(item.url) && !VIDEO_URL.test(item.url);
    });
    return image?.url || '';
  }
}
