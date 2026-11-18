import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Repository } from 'typeorm';
import { Roles } from '../../auth/presentation/decorators/roles.decorator';
import { User, UserRole, UserStatus } from '../../users/domain/user.entity';
import { IsNull } from 'typeorm';
import { Property } from '../domain/property.entity';
import { PropertyType } from '../../property-types/domain/property-type.entity';
import { PropertyService } from '../application/property.service';
import { PropertyStatus } from '../../../shared/enums/property-status.enum';
import { REGION_COMMUNES } from '../../../shared/regions/regions.data';
import { AGENT_CREATE_FIELDS, STATUSES_REQUIRING_AGENT } from '../application/agent-create-validation';
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
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Property) private readonly properties: Repository<Property>,
  ) {}

  @Get('catalogs')
  @ApiOperation({ summary: 'Valores válidos y reglas para crear y editar propiedades' })
  async catalogs() {
    const propertyTypes = await this.types.find({ order: { name: 'ASC' } });
    const agents = await this.users.find({
      where: [
        { role: UserRole.AGENT, status: UserStatus.ACTIVE, deletedAt: IsNull() },
        { role: UserRole.ADMIN, status: UserStatus.ACTIVE, deletedAt: IsNull() },
      ],
      select: { id: true, username: true, email: true, role: true },
      order: { username: 'ASC' },
    });
    return {
      agents: agents.map((u) => ({ id: u.id, name: u.username, email: u.email, role: u.role })),
      statusesRequiringAgent: STATUSES_REQUIRING_AGENT,
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
      requiredWhen: `assignedAgentId (id de agents) es obligatorio si status es ${STATUSES_REQUIRING_AGENT.join(', ')}; con REQUEST no hace falta.`,
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
        'Para publicar: status PUBLISHED, un assignedAgentId de la lista agents y la key con permiso properties:publish.',
        'Publicar (status PUBLISHED) exige que la key tenga el permiso properties:publish.',
      ],
    };
  }

  @Get('properties')
  @ApiOperation({ summary: 'Lista liviana y paginada de propiedades (incluye borradores REQUEST)' })
  async list(@Query() q: Record<string, string>) {
    const page = Math.max(1, parseInt(q.page ?? '1', 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(q.limit ?? '20', 10) || 20));
    const qb = this.properties
      .createQueryBuilder('p')
      .select(['p.id', 'p.code', 'p.title', 'p.status', 'p.operationType', 'p.price', 'p.currencyPrice', 'p.state', 'p.city', 'p.assignedAgentId', 'p.mainImageUrl', 'p.createdAt', 'p.updatedAt'])
      .where('p.deletedAt IS NULL')
      .orderBy('p.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
    if (q.status) qb.andWhere('p.status = :status', { status: q.status });
    if (q.operationType) qb.andWhere('p.operationType = :op', { op: q.operationType });
    if (q.state) qb.andWhere('p.state = :state', { state: q.state });
    if (q.city) qb.andWhere('p.city = :city', { city: q.city });
    if (q.q) qb.andWhere('(p.title LIKE :t OR p.code LIKE :t)', { t: `%${q.q}%` });
    const [rows, total] = await qb.getManyAndCount();
    return {
      page, limit, total, totalPages: Math.ceil(total / limit),
      data: rows.map((p) => ({
        id: p.id, code: p.code, title: p.title, status: p.status, operationType: p.operationType,
        price: p.price == null ? null : { amount: Number(p.price), currency: p.currencyPrice },
        region: p.state ?? null, commune: p.city ?? null,
        assignedAgentId: p.assignedAgentId ?? null, hasMainImage: !!p.mainImageUrl,
        createdAt: p.createdAt, updatedAt: p.updatedAt,
      })),
    };
  }

  @Get('properties/:id')
  @ApiOperation({ summary: 'Ficha completa de una propiedad, autoexplicativa para un agente' })
  async property(@Param('id') id: string) {
    const p: any = await this.propertyService.findOne(id, false);
    if (!p) throw new NotFoundException('Propiedad no encontrada');

    const images = (p.multimedia ?? []).filter((m: any) => m.format === 'IMG');
    const videos = (p.multimedia ?? []).filter((m: any) => m.format === 'VIDEO');

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
