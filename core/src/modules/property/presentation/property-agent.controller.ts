import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Repository } from 'typeorm';
import { Roles } from '../../auth/presentation/decorators/roles.decorator';
import { UserRole } from '../../users/domain/user.entity';
import { PropertyType } from '../../property-types/domain/property-type.entity';
import { PropertyService } from '../application/property.service';
import { PropertyStatus } from '../../../shared/enums/property-status.enum';
import { REGION_COMMUNES } from '../../../shared/regions/regions.data';
import { AGENT_CREATE_FIELDS } from '../application/agent-create-validation';
import { MAX_IMAGES_PER_UPLOAD, MAX_IMAGE_BYTES, MAX_VIDEO_BYTES } from './property-media-upload';

const STATUS_MEANING: Record<string, string> = {
  [PropertyStatus.REQUEST]: 'Solicitud: borrador pendiente de revisión',
  [PropertyStatus.PRE_APPROVED]: 'Preaprobada: revisada, aún no visible en el portal',
  [PropertyStatus.PUBLISHED]: 'Publicada: visible en el portal (requiere permiso properties:publish)',
  [PropertyStatus.INACTIVE]: 'Inactiva: oculta del portal',
  [PropertyStatus.SOLD]: 'Vendida',
  [PropertyStatus.RENTED]: 'Arrendada',
  [PropertyStatus.CONTRACT_IN_PROGRESS]: 'Contrato en curso (lo gestiona el módulo de contratos)',
};

/** Lecturas pensadas para agentes de IA: catálogos de valores válidos y la ficha autoexplicativa. */
@ApiTags('Agent')
@ApiBearerAuth()
@Roles(UserRole.ADMIN, UserRole.AGENT)
@Controller('agent')
export class PropertyAgentController {
  constructor(
    private readonly propertyService: PropertyService,
    @InjectRepository(PropertyType) private readonly types: Repository<PropertyType>,
  ) {}

  @Get('catalogs')
  @ApiOperation({ summary: 'Valores válidos y reglas para crear y editar propiedades' })
  async catalogs() {
    const propertyTypes = await this.types.find({ order: { name: 'ASC' } });
    return {
      propertyTypes: propertyTypes.map((t) => ({ id: t.id, name: t.name, description: t.description ?? null })),
      statuses: Object.values(PropertyStatus).map((value) => ({ value, meaning: STATUS_MEANING[value] })),
      operationTypes: [
        { value: 'SALE', meaning: 'Venta' },
        { value: 'RENT', meaning: 'Arriendo' },
      ],
      currencies: [
        { value: 'CLP', meaning: 'Peso chileno (entero, sin decimales)' },
        { value: 'UF', meaning: 'Unidad de fomento (admite decimales)' },
      ],
      regions: Object.entries(REGION_COMMUNES).map(([name, communes]) => ({ name, communes })),
      createFields: AGENT_CREATE_FIELDS,
      required: ['title', 'status', 'operationType', 'state', 'city'],
      media: {
        maxImagesPerUpload: MAX_IMAGES_PER_UPLOAD,
        maxImageBytes: MAX_IMAGE_BYTES,
        maxVideoBytes: MAX_VIDEO_BYTES,
        imageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        videoTypes: ['video/mp4', 'video/webm'],
        upload:
          'Las imágenes se suben por HTTP directo: POST /properties/{id}/multimedia con multipart/form-data, un campo "files" por archivo y el header Authorization: Bearer <tu key>. No se envían por MCP ni en base64.',
      },
      notes: [
        'state y city deben ser nombres exactos de este catálogo (la comuna debe pertenecer a la región).',
        'Un campo inválido se rechaza con 400 y un mensaje por campo; nada se corrige en silencio.',
        'Publicar (status PUBLISHED) exige que la key tenga el permiso properties:publish.',
      ],
    };
  }

  @Get('properties/:id')
  @ApiOperation({ summary: 'Ficha completa de una propiedad, autoexplicativa para un agente' })
  async property(@Param('id') id: string) {
    const p: any = await this.propertyService.findOne(id, false);
    if (!p) throw new NotFoundException('Propiedad no encontrada');

    const images = (p.multimedia ?? []).filter((m: any) => m.type === 'IMAGE' || m.type === 'image');
    const videos = (p.multimedia ?? []).filter((m: any) => m.type === 'VIDEO' || m.type === 'video');

    // Datos recomendados antes de publicar (no son obligatorios para guardar).
    const recommended: Array<[string, unknown]> = [
      ['description', p.description],
      ['price', p.price],
      ['propertyTypeId', p.propertyTypeId ?? p.propertyType?.id],
      ['address', p.address],
      ['builtSquareMeters', p.builtSquareMeters],
      ['bedrooms', p.bedrooms],
      ['bathrooms', p.bathrooms],
      ['images', images.length ? true : undefined],
      ['mainImageUrl', p.mainImageUrl],
    ];
    const isEmpty = (v: unknown) => v === undefined || v === null || v === '' || v === 0;

    return {
      id: p.id,
      code: p.code,
      title: p.title,
      description: p.description ?? null,
      status: { value: p.status, meaning: STATUS_MEANING[p.status] ?? null },
      operation: p.operationType === 'RENT' ? 'Arriendo' : 'Venta',
      operationType: p.operationType,
      propertyType: p.propertyType ? { id: p.propertyType.id, name: p.propertyType.name } : null,
      price: p.price == null ? null : { amount: Number(p.price), currency: p.currencyPrice },
      location: {
        region: p.state ?? null,
        commune: p.city ?? null,
        address: p.address ?? null,
        latitude: p.latitude ?? null,
        longitude: p.longitude ?? null,
      },
      characteristics: {
        bedrooms: p.bedrooms ?? null,
        bathrooms: p.bathrooms ?? null,
        parkingSpaces: p.parkingSpaces ?? null,
        floors: p.floors ?? null,
        builtSquareMeters: p.builtSquareMeters ?? null,
        landSquareMeters: p.landSquareMeters ?? null,
        constructionYear: p.constructionYear ?? null,
        otherFeatures: p.otherFeatures ?? [],
      },
      seo: { title: p.seoTitle ?? null, description: p.seoDescription ?? null },
      media: {
        mainImageUrl: p.mainImageUrl ?? null,
        images: images.map((m: any) => ({ id: m.id, url: m.url, filename: m.filename, width: m.width ?? null, height: m.height ?? null })),
        videos: videos.map((m: any) => ({ id: m.id, url: m.url, filename: m.filename })),
      },
      isFeatured: !!p.isFeatured,
      publishedAt: p.publishedAt ?? null,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      missingForPublishing: recommended.filter(([, v]) => isEmpty(v)).map(([k]) => k),
    };
  }
}
