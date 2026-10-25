import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ValidationPipe,
  Res,
  UseInterceptors,
  UploadedFiles,
  Req,
  UseGuards,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  Logger,
  HttpException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Response, Request } from 'express';
import { plainToClass } from 'class-transformer';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { PropertyService } from '../application/property.service';
import { Property } from '../domain/property.entity';
import { CreatePropertyDto, UpdatePropertyDto, UpdatePropertyCharacteristicsDto } from '../dto/property.dto';
import { UpdatePropertyLocationDto } from '../dto/update-property-location.dto';
import { UpdatePropertyBasicDto } from '../dto/update-property-basic.dto';
import { CreatePropertyDto as CreatePropertyPayloadDto } from '../dto/create-property.dto';
import { UpdateMainImageDto } from '../dto/create-property.dto';
import { UpdatePropertyPriceDto } from '../dto/update-property-price.dto';
import { UpdatePropertySeoDto } from '../dto/update-property-seo.dto';
import { SharePropertyDto } from '../dto/share-property.dto';
import { GridSaleQueryDto } from '../dto/grid-sale.dto';
import { GridRentQueryDto } from '../dto/grid-rent.dto';
import { GetFullPropertyDto } from '../dto/get-full-property.dto';
import { FilterRentPropertiesDto } from '../dto/filter-rent-properties.dto';
import { FilterSalePropertiesDto } from '../dto/filter-sale-properties.dto';
import { ListAvailableRentPropertiesDto } from '../dto/list-available-rent-properties.dto';
import { Audit } from '../../../shared/interceptors/audit.interceptor';
import { AuditAction, AuditEntityType } from '../../../shared/enums/audit.enums';
import { JwtAuthGuard, RolesGuard, Roles, Public } from '../../auth/guards/jwt-auth.guard';
import { UserRole } from '../../users/domain/user.entity';
import { PropertyOperationType } from '../../../shared/enums/property-operation-type.enum';
import { UploadPropertyMultimediaDto } from '../dto/upload-property-multimedia.dto';
import { FileUploadService } from '../../../shared/services/file-upload.service';
import {
  assertPropertyMediaSizes,
  propertyMediaUploadOptions,
  removeUploadedTempFiles,
} from './property-media-upload';
import { toPublicPropertyRequest } from '../application/public-property-request';
import { StrictThrottle } from '../../../shared/security/throttle';

const isStaffRole = (role?: string): boolean =>
  role === UserRole.ADMIN || role === UserRole.AGENT;

@ApiTags('Properties')
@Roles(UserRole.ADMIN, UserRole.AGENT)
@Controller('properties')
export class PropertyController {
  private readonly logger = new Logger(PropertyController.name);

  constructor(
    private readonly propertyService: PropertyService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Get('grid-sale/excel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Export sale properties to Excel' })
  @ApiResponse({ status: 200, description: 'Excel file exported successfully' })
  @ApiQuery({ name: 'fields', required: false, type: String, description: 'Comma-separated fields to export' })
  @ApiQuery({ name: 'sort', required: false, enum: ['asc', 'desc'], description: 'Sort order' })
  @ApiQuery({ name: 'sortField', required: false, type: String, description: 'Field to sort by' })
  @Audit(AuditAction.READ, AuditEntityType.PROPERTY, 'Sale properties Excel exported')
  async exportSaleGridExcel(
    @Query(ValidationPipe) query: GridSaleQueryDto,
    @Res() res: Response,
  ) {
    const buffer = await this.propertyService.exportSalePropertiesExcel(query);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="propiedades-en-venta.xlsx"',
    });
    res.send(buffer);
  }

  @Get('grid-rent/excel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Export rent properties to Excel' })
  @ApiResponse({ status: 200, description: 'Excel file exported successfully' })
  @ApiQuery({ name: 'fields', required: false, type: String, description: 'Comma-separated fields to export' })
  @ApiQuery({ name: 'sort', required: false, enum: ['asc', 'desc'], description: 'Sort order' })
  @ApiQuery({ name: 'sortField', required: false, type: String, description: 'Field to sort by' })
  @Audit(AuditAction.READ, AuditEntityType.PROPERTY, 'Rent properties Excel exported')
  async exportRentGridExcel(
    @Query(ValidationPipe) query: GridRentQueryDto,
    @Res() res: Response,
  ) {
    const buffer = await this.propertyService.exportRentPropertiesExcel(query);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="propiedades-en-arriendo.xlsx"',
    });
    res.send(buffer);
  }

  /**
   * Public endpoint to publish property with multimedia (no authentication required)
   */
  @Public()
  @StrictThrottle()
  @Post('public/publish')
  @ApiTags('Properties')
  @ApiOperation({ summary: 'Publish a property with multimedia (public - no auth required)' })
  @ApiResponse({ status: 201, description: 'Property created successfully', type: Property })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: CreatePropertyPayloadDto,
    description: 'Property data with multimedia files',
  })
  @UseInterceptors(FilesInterceptor('multimediaFiles', 10, propertyMediaUploadOptions(10)))
  async publishPublic(
    @Body() body: any,
    @Req() request: any,
    @UploadedFiles() files?: Express.Multer.File[]
  ) {
    try {
      assertPropertyMediaSizes(files);

      let rawPayload: unknown;
      try {
        rawPayload = body?.data
          ? (typeof body.data === 'string' ? JSON.parse(body.data) : body.data)
          : body;
      } catch {
        throw new BadRequestException('JSON inválido en el campo data');
      }

      // Solo campos de solicitud y estado REQUEST: el visitante no decide estado,
      // destacada, agente, creador, SEO ni notas internas.
      const validatedDto = await new ValidationPipe({
        transform: true,
        whitelist: true,
        transformOptions: { enableImplicitConversion: true },
      }).transform(toPublicPropertyRequest(rawPayload), {
        type: 'body',
        metatype: CreatePropertyPayloadDto,
      });

      // Ruta @Public: el guard global valida un Bearer opcional y deja req.user si es válido.
      const creatorId: string = request?.user?.id ?? 'anonymous';

      return await this.propertyService.createPropertyWithFiles(validatedDto, creatorId, files || []);
    } finally {
      await removeUploadedTempFiles(files);
    }
  }

  @Post()
  @ApiTags('Properties')
  @ApiOperation({ summary: 'Create a new property with multimedia' })
  @ApiResponse({ status: 201, description: 'Property created successfully', type: Property })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: CreatePropertyPayloadDto,
    description: 'Property data with multimedia files',
  })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('multimediaFiles', 10, propertyMediaUploadOptions(10)))
  @Audit(AuditAction.CREATE, AuditEntityType.PROPERTY, 'Property created')
  async create(
    @Body() body: any,
    @Req() request: any,
    @UploadedFiles() files?: Express.Multer.File[]
  ) {
    // Parse the 'data' field from FormData which contains the JSON string
    let createPropertyDto: CreatePropertyPayloadDto;
    try {
      assertPropertyMediaSizes(files);
      if (body.data) {
        // If data is sent as a field in the form
        createPropertyDto = typeof body.data === 'string'
          ? JSON.parse(body.data)
          : body.data;
      } else {
        // Fallback: assume the body is the DTO directly
        createPropertyDto = body;
      }

      // Validate the DTO (sin agregar archivos que pueden ser filtrados)
      const validatedDto = await new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true }
      }).transform(createPropertyDto, { type: 'body', metatype: CreatePropertyPayloadDto });

      // El guard global (JwtAuthGuard) ya autenticó la petición y dejó req.user.
      const creatorId: string | undefined = request.user?.id;
      if (!creatorId) {
        throw new UnauthorizedException('Autenticación requerida');
      }

      // Pasar archivos como parámetro separado en lugar de dentro del DTO
      const result = await this.propertyService.createPropertyWithFiles(validatedDto, creatorId, files || []);

      return result;
    } catch (error) {
      this.logger.error(
        `Error creando propiedad: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );

      // Re-throw known Nest exceptions
      if (error instanceof HttpException) {
        throw error;
      }

      // If authentication-related, return 401
      const msg = error?.message || '';
      if (msg.includes('Authentication required') || msg.includes('User ID not found') || msg.toLowerCase().includes('token')) {
        // Use UnauthorizedException to return 401
        throw new UnauthorizedException('Autenticación requerida');
      }

      if (msg.includes('validation')) {
        throw new BadRequestException('Datos de la propiedad inválidos');
      }

      if (msg.includes('multimedia') || msg.includes('upload')) {
        throw new BadRequestException('Error al subir archivos de la propiedad');
      }

      throw new BadRequestException('No se pudo crear la propiedad');
    } finally {
      await removeUploadedTempFiles(files);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all properties with filters' })
  @ApiResponse({ status: 200, description: 'List of properties', type: [Property] })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'operationType', required: false, type: String })
  @Audit(AuditAction.READ, AuditEntityType.PROPERTY, 'Properties listed')
  findAll(@Query() filters: any) {
    return this.propertyService.findAll(filters);
  }

  @Get('grid-sale')
  @ApiOperation({ summary: 'Get sale properties grid with pagination' })
  @ApiResponse({ status: 200, description: 'Grid of sale properties' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sort', required: false, enum: ['asc', 'desc'] })
  @Audit(AuditAction.READ, AuditEntityType.PROPERTY, 'Sale properties grid viewed')
  gridSale(@Query(ValidationPipe) query: GridSaleQueryDto) {
    return this.propertyService.gridSaleProperties(query);
  }

  @Get('grid-rent')
  @ApiOperation({ summary: 'Get rent properties grid with pagination' })
  @ApiResponse({ status: 200, description: 'Grid of rent properties' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sort', required: false, enum: ['asc', 'desc'] })
  @Audit(AuditAction.READ, AuditEntityType.PROPERTY, 'Rent properties grid viewed')
  gridRent(@Query(ValidationPipe) query: GridRentQueryDto) {
    return this.propertyService.gridRentProperties(query);
  }

  @Get('available-rent')
  @ApiOperation({ summary: 'List rent properties available for contract creation' })
  @ApiResponse({ status: 200, description: 'List of available rent properties' })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Audit(AuditAction.READ, AuditEntityType.PROPERTY, 'Available rent properties listed for contracts')
  listAvailableRent(@Query(ValidationPipe) query: ListAvailableRentPropertiesDto) {
    return this.propertyService.listAvailableRentProperties(query);
  }

  /**
   * Endpoint público (sin token) para listar propiedades publicadas visibles en el portal.
   */
  @Public()
  @Get('public')
  @ApiOperation({ summary: 'Get published properties for portal (public)' })
  @ApiResponse({ status: 200, description: 'List of published properties' })
  @Audit(AuditAction.READ, AuditEntityType.PROPERTY, 'Public list of published properties')
  async listPublishedPublic() {
    return await this.propertyService.listPublishedPublic();
  }

  @Public()
  @Get('public/featured')
  @ApiOperation({ summary: 'Get featured properties (public)' })
  @ApiResponse({ status: 200, description: 'List of featured properties' })
  async getPublicFeatured() {
    const data = await this.propertyService.findPublishedFeaturedPublic();
    return { success: true, data };
  }

  @Public()
  @Get('public/featured/paginated')
  @ApiOperation({ summary: 'Get featured properties with pagination (public)' })
  @ApiResponse({ status: 200, description: 'Paginated list of featured properties' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getPublicFeaturedPaginated(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? Math.max(1, parseInt(page, 10)) : 1;
    const limitNum = limit ? Math.min(Math.max(1, parseInt(limit, 10)), 16) : 9;
    const data = await this.propertyService.findPublishedFeaturedPublicPaginated(pageNum, limitNum);
    return { success: true, ...data };
  }

  /**
   * Devuelve todos los detalles de la propiedad, incluyendo relaciones y datos agregados.
   */
  @Public()
  @Get(':id/full')
  @ApiOperation({ summary: 'Get full property details with all relations' })
  @ApiResponse({ status: 200, description: 'Complete property details', type: GetFullPropertyDto })
  @ApiParam({ name: 'id', type: String, description: 'Property ID' })
  @Audit(AuditAction.READ, AuditEntityType.PROPERTY, 'Full property details viewed')
  async getFullProperty(
    @Param('id') id: string,
    @Req() req?: any,
  ): Promise<GetFullPropertyDto | Record<string, unknown>> {
    // Staff (ADMIN/AGENT) ve el detalle completo; el resto solo propiedades
    // publicadas y campos seguros.
    if (isStaffRole(req?.user?.role)) {
      return await this.propertyService.getFullProperty(id);
    }
    return await this.propertyService.getPublicFullProperty(id);
  }

  /**
   * Actualiza solo la información básica de la propiedad
   */
  @Patch(':id/basic')
  @ApiOperation({ summary: 'Update basic property information' })
  @ApiResponse({ status: 200, description: 'Property updated', type: Property })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdatePropertyBasicDto })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Audit(AuditAction.UPDATE, AuditEntityType.PROPERTY, 'Property basic info updated')
  async updateBasic(
    @Param('id') id: string,
    @Body(new ValidationPipe({ transform: true })) dto: UpdatePropertyBasicDto,
    @Req() request: any,
  ): Promise<Property> {
    const user = request?.user;
    const userId = user?.id || user?.sub || (typeof user === 'string' ? user : undefined);
    return await this.propertyService.update(id, dto as UpdatePropertyDto, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update property information' })
  @ApiResponse({ status: 200, description: 'Property updated successfully', type: Property })
  @ApiResponse({ status: 404, description: 'Property not found' })
  @ApiParam({ name: 'id', type: String, description: 'Property ID' })
  @ApiBody({ type: UpdatePropertyDto })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Audit(AuditAction.UPDATE, AuditEntityType.PROPERTY, 'Property updated')
  update(
    @Param('id') id: string,
    @Body(new ValidationPipe({ transform: true })) updatePropertyDto: UpdatePropertyDto,
    @Req() request: any,
  ) {
    const user = request?.user;
    const userId = user?.id || user?.sub || (typeof user === 'string' ? user : undefined);
    return this.propertyService.update(id, updatePropertyDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete property' })
  @ApiResponse({ status: 200, description: 'Property deleted successfully' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  @ApiParam({ name: 'id', type: String })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Audit(AuditAction.DELETE, AuditEntityType.PROPERTY, 'Property deleted')
  remove(@Param('id') id: string, @Req() req: Request) {
    const userId = this.extractUserId(req);
    return this.propertyService.remove(id, userId);
  }

    /**
   * Total de propiedades en venta
   */
  @Get('count-sale')
  @ApiOperation({ summary: 'Get total count of sale properties' })
  @ApiResponse({ status: 200, description: 'Total count returned' })
  @Audit(AuditAction.READ, AuditEntityType.PROPERTY, 'Count sale properties')
  async countSaleProperties() {
    return { total: await this.propertyService.countSaleProperties() };
  }

  /**
   * Total de propiedades publicadas
   */
  @Get('count-published')
  @ApiOperation({ summary: 'Get total count of published properties' })
  @ApiResponse({ status: 200, description: 'Total count returned' })
  @Audit(AuditAction.READ, AuditEntityType.PROPERTY, 'Count published properties')
  async countPublishedProperties() {
    return { total: await this.propertyService.countPublishedProperties() };
  }

  /**
   * Total de propiedades destacadas
   */
  @Get('count-featured')
  @ApiOperation({ summary: 'Get total count of featured properties' })
  @ApiResponse({ status: 200, description: 'Total count returned' })
  @Audit(AuditAction.READ, AuditEntityType.PROPERTY, 'Count featured properties')
  async countFeaturedProperties() {
    return { total: await this.propertyService.countFeaturedProperties() };
  }

  @Patch(':id/main-image')
  @ApiOperation({ summary: 'Update property main image' })
  @ApiResponse({ status: 200, description: 'Main image updated', type: Property })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateMainImageDto })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Audit(AuditAction.UPDATE, AuditEntityType.PROPERTY, 'Main image updated')
  async updateMainImage(
    @Param('id') id: string,
    @Body(new ValidationPipe({ transform: true })) dto: UpdateMainImageDto,
    @Req() req: any,
  ): Promise<Property> {
    const userId = this.extractUserId(req);
    return this.propertyService.updateMainImage(id, dto.mainImageUrl, userId);
  }

  /**
   * Actualiza la información de precio y SEO de una propiedad
   */
  @Patch(':id/price')
  @ApiOperation({ summary: 'Update property price and SEO information' })
  @ApiResponse({ status: 200, description: 'Price updated', type: Property })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdatePropertyPriceDto })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Audit(AuditAction.UPDATE, AuditEntityType.PROPERTY, 'Property price and SEO updated')
  async updatePrice(
    @Param('id') id: string,
    @Body(new ValidationPipe({ transform: true })) dto: UpdatePropertyPriceDto,
    @Req() req: any,
  ): Promise<Property> {
    const userId = this.extractUserId(req);
    return this.propertyService.updatePrice(id, dto, userId);
  }

  /**
   * Actualiza las características de una propiedad
   */
  @Patch(':id/characteristics')
  @ApiOperation({ summary: 'Update property characteristics' })
  @ApiResponse({ status: 200, description: 'Characteristics updated', type: Property })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdatePropertyCharacteristicsDto })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Audit(AuditAction.UPDATE, AuditEntityType.PROPERTY, 'Property characteristics updated')
  async updateCharacteristics(
    @Param('id') id: string,
    @Body(new ValidationPipe({ transform: true })) dto: UpdatePropertyCharacteristicsDto,
    @Req() req: any,
  ): Promise<Property> {
    const userId = this.extractUserId(req);
    return this.propertyService.updateCharacteristics(id, dto, userId);
  }

  /**
   * Actualiza la ubicación de una propiedad
   */
  @Patch(':id/location')
  @ApiOperation({ summary: 'Update property location' })
  @ApiResponse({ status: 200, description: 'Location updated', type: Property })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdatePropertyLocationDto })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Audit(AuditAction.UPDATE, AuditEntityType.PROPERTY, 'Property location updated')
  async updateLocation(
    @Param('id') id: string,
    @Body(new ValidationPipe({ transform: true })) dto: UpdatePropertyLocationDto,
    @Req() req: any,
  ): Promise<Property> {
    const userId = this.extractUserId(req);
    return this.propertyService.updateLocation(id, dto, userId);
  }

  /**
   * Obtiene datos SEO de una propiedad
   */
  @Get(':id/seo')
  @ApiOperation({ summary: 'Get property SEO data' })
  @ApiResponse({ status: 200, description: 'SEO data retrieved' })
  @ApiParam({ name: 'id', type: String })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Audit(AuditAction.READ, AuditEntityType.PROPERTY, 'Property SEO data retrieved')
  async getSeoData(@Param('id') id: string) {
    return await this.propertyService.getSeoData(id);
  }

  /**
   * Actualiza datos SEO de una propiedad
   */
  @Patch(':id/seo')
  @ApiOperation({ summary: 'Update property SEO data' })
  @ApiResponse({ status: 200, description: 'SEO data updated' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdatePropertySeoDto })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Audit(AuditAction.UPDATE, AuditEntityType.PROPERTY, 'Property SEO data updated')
  async updateSeoData(
    @Param('id') id: string,
    @Body(new ValidationPipe({ transform: true })) dto: UpdatePropertySeoDto,
    @Req() req: any,
  ) {
    const userId = this.extractUserId(req);
    return await this.propertyService.updateSeoData(id, dto, userId);
  }

  /**
   * Verifica si una multimedia específica es la imagen principal de la propiedad
   */
  @Get(':propertyId/multimedia/:multimediaId/is-main')
  @ApiOperation({ summary: 'Check if multimedia is main image' })
  @ApiResponse({ status: 200, description: 'Boolean result' })
  @ApiParam({ name: 'propertyId', type: String })
  @ApiParam({ name: 'multimediaId', type: String })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Audit(AuditAction.READ, AuditEntityType.PROPERTY, 'Multimedia main status checked')
  async isMultimediaMain(
    @Param('propertyId') propertyId: string,
    @Param('multimediaId') multimediaId: string,
  ): Promise<{ isMain: boolean }> {
    const isMain = await this.propertyService.isMultimediaMain(propertyId, multimediaId);
    return { isMain };
  }

  /**
   * Get published properties with filters and pagination (9 per page)
   * Query params: currency, state, city, typeProperty, operation, page, bedrooms, bathrooms, parkingSpaces, bedroomsOperator, bathroomsOperator, parkingSpacesOperator, builtSquareMetersMin, landSquareMetersMin, constructionYearMin
   */
  @Public()
  @Get('published/filtered')
  @ApiOperation({ summary: 'Get published properties with filters' })
  @ApiResponse({ status: 200, description: 'Filtered properties list' })
  @ApiQuery({ name: 'currency', required: false })
  @ApiQuery({ name: 'state', required: false })
  @ApiQuery({ name: 'city', required: false })
  @ApiQuery({ name: 'typeProperty', required: false })
  @ApiQuery({ name: 'operation', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'bedrooms', required: false, type: Number })
  @ApiQuery({ name: 'bathrooms', required: false, type: Number })
  @ApiQuery({ name: 'parkingSpaces', required: false, type: Number })
  @ApiQuery({ name: 'bedroomsOperator', required: false, enum: ['lte', 'eq', 'gte'] })
  @ApiQuery({ name: 'bathroomsOperator', required: false, enum: ['lte', 'eq', 'gte'] })
  @ApiQuery({ name: 'parkingSpacesOperator', required: false, enum: ['lte', 'eq', 'gte'] })
  @ApiQuery({ name: 'builtSquareMetersMin', required: false, type: Number })
  @ApiQuery({ name: 'builtSquareMetersMax', required: false, type: Number })
  @ApiQuery({ name: 'landSquareMetersMin', required: false, type: Number })
  @ApiQuery({ name: 'landSquareMetersMax', required: false, type: Number })
  @ApiQuery({ name: 'constructionYearMin', required: false, type: Number })
  @ApiQuery({ name: 'priceMin', required: false, type: Number })
  @ApiQuery({ name: 'priceMax', required: false, type: Number })
  @ApiQuery({ name: 'typeIds', required: false, description: 'CSV of property type UUIDs' })
  @ApiQuery({ name: 'types', required: false, description: 'Alias of typeIds CSV' })
  @ApiQuery({ name: 'otherFeatures', required: false, description: 'CSV of OTHER_FEATURE_KEYS' })
  @ApiQuery({ name: 'features', required: false, description: 'Alias of otherFeatures CSV' })
  async getPublishedPropertiesFiltered(
    @Query(new ValidationPipe({ transform: true })) filters: any,
  ) {
    return this.propertyService.getPublishedPropertiesFiltered(filters);
  }

  /**
   * Get published rent properties with filters and pagination
   * Automatically filters by operationType = 'RENT'
   */
  @Public()
  @Get('rent')
  @ApiOperation({ summary: 'Get published rent properties with filters' })
  @ApiResponse({ status: 200, description: 'Filtered rent properties list' })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'priceMin', required: false, type: Number })
  @ApiQuery({ name: 'priceMax', required: false, type: Number })
  @ApiQuery({ name: 'bedrooms', required: false, type: Number })
  @ApiQuery({ name: 'bedroomsOperator', required: false, type: String, enum: ['lte', 'eq', 'gte'] })
  @ApiQuery({ name: 'bathrooms', required: false, type: Number })
  @ApiQuery({ name: 'bathroomsOperator', required: false, type: String, enum: ['lte', 'eq', 'gte'] })
  @ApiQuery({ name: 'parkingSpaces', required: false, type: Number })
  @ApiQuery({ name: 'parkingSpacesOperator', required: false, type: String, enum: ['lte', 'eq', 'gte'] })
  @ApiQuery({ name: 'typeProperty', required: false, type: String })
  @ApiQuery({ name: 'typeIds', required: false, type: String })
  @ApiQuery({ name: 'otherFeatures', required: false, type: String })
  @ApiQuery({ name: 'builtSquareMetersMin', required: false, type: Number })
  @ApiQuery({ name: 'builtSquareMetersMax', required: false, type: Number })
  @ApiQuery({ name: 'landSquareMetersMin', required: false, type: Number })
  @ApiQuery({ name: 'landSquareMetersMax', required: false, type: Number })
  @ApiQuery({ name: 'state', required: false, type: String })
  @ApiQuery({ name: 'city', required: false, type: String })
  @ApiQuery({ name: 'currency', required: false, type: String })
  @ApiQuery({ name: 'sort', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Audit(AuditAction.READ, AuditEntityType.PROPERTY, 'Rent properties filtered')
  async getPublishedRentPropertiesFiltered(
    @Query(new ValidationPipe({ transform: true })) dto: FilterRentPropertiesDto,
  ) {
    return this.propertyService.getPublishedRentPropertiesFiltered(dto);
  }

  /**
   * Get price range for published properties
   */
  @Get('price-range')
  @ApiOperation({ summary: 'Get min and max price for published properties' })
  @ApiResponse({ status: 200, description: 'Price range retrieved', schema: {
    type: 'object',
    properties: {
      minPrice: { type: 'number' },
      maxPrice: { type: 'number' }
    }
  }})
  @ApiQuery({ name: 'operationType', required: false, enum: ['SALE', 'RENT'], description: 'Filter by operation type' })
  @ApiQuery({ name: 'currency', required: false, enum: ['CLP', 'UF'], description: 'Filter by currency' })
  async getPriceRange(
    @Query('operationType') operationType?: PropertyOperationType,
    @Query('currency') currency?: string,
  ) {
    return this.propertyService.getPriceRange(operationType, currency);
  }

  /**
   * Min/max bounds for sidebar range filters (price, surfaces, year)
   */
  @Public()
  @Get('filter-bounds')
  @ApiOperation({ summary: 'Get min/max bounds for published property range filters' })
  @ApiResponse({ status: 200, description: 'Filter bounds retrieved' })
  @ApiQuery({ name: 'operationType', required: false, enum: ['SALE', 'RENT'] })
  @ApiQuery({ name: 'currency', required: false, enum: ['CLP', 'UF'] })
  async getFilterBounds(
    @Query('operationType') operationType?: PropertyOperationType,
    @Query('currency') currency?: string,
  ) {
    return this.propertyService.getFilterBounds({ operationType, currency });
  }

  /**
   * Get related properties based on similarity algorithm
   */
  @Public()
  @Get('related/:id')
  @ApiOperation({ summary: 'Get related properties for a specific property' })
  @ApiResponse({ status: 200, description: 'Related properties retrieved', type: [Property] })
  @ApiParam({ name: 'id', description: 'Property ID' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Maximum number of related properties (default: 5)' })
  async getRelatedProperties(
    @Param('id') id: string,
    @Query('limit') limit?: number,
  ) {
    const maxLimit = limit ? Math.min(Math.max(parseInt(String(limit), 10), 3), 10) : 5;
    return this.propertyService.getRelatedProperties(id, maxLimit);
  }

  /**
   * Get published sale properties with filters and pagination
   * Automatically filters by operationType = 'SALE'
   */
  @Public()
  @Get('sale')
  @ApiOperation({ summary: 'Get published sale properties with filters' })
  @ApiResponse({ status: 200, description: 'Filtered sale properties list' })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'priceMin', required: false, type: Number })
  @ApiQuery({ name: 'priceMax', required: false, type: Number })
  @ApiQuery({ name: 'bedrooms', required: false, type: Number })
  @ApiQuery({ name: 'bedroomsOperator', required: false, type: String, enum: ['lte', 'eq', 'gte'] })
  @ApiQuery({ name: 'bathrooms', required: false, type: Number })
  @ApiQuery({ name: 'bathroomsOperator', required: false, type: String, enum: ['lte', 'eq', 'gte'] })
  @ApiQuery({ name: 'parkingSpaces', required: false, type: Number })
  @ApiQuery({ name: 'parkingSpacesOperator', required: false, type: String, enum: ['lte', 'eq', 'gte'] })
  @ApiQuery({ name: 'typeProperty', required: false, type: String })
  @ApiQuery({ name: 'typeIds', required: false, type: String })
  @ApiQuery({ name: 'otherFeatures', required: false, type: String })
  @ApiQuery({ name: 'builtSquareMetersMin', required: false, type: Number })
  @ApiQuery({ name: 'builtSquareMetersMax', required: false, type: Number })
  @ApiQuery({ name: 'landSquareMetersMin', required: false, type: Number })
  @ApiQuery({ name: 'landSquareMetersMax', required: false, type: Number })
  @ApiQuery({ name: 'state', required: false, type: String })
  @ApiQuery({ name: 'city', required: false, type: String })
  @ApiQuery({ name: 'currency', required: false, type: String })
  @ApiQuery({ name: 'sort', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Audit(AuditAction.READ, AuditEntityType.PROPERTY, 'Sale properties filtered')
  async getPublishedSalePropertiesFiltered(
    @Query(new ValidationPipe({ transform: true })) dto: FilterSalePropertiesDto,
  ) {
    return this.propertyService.getPublishedSalePropertiesFiltered(dto);
  }

  /**
   * Crear una solicitud de publicación de propiedad desde el portal
   */
  @Roles(UserRole.ADMIN, UserRole.AGENT, UserRole.COMMUNITY)
  @Post('request')
  @ApiOperation({ summary: 'Create property request from portal' })
  @ApiResponse({ status: 201, description: 'Property request created', type: Property })
  @ApiBody({ type: Object })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Audit(AuditAction.CREATE, AuditEntityType.PROPERTY, 'Property request created from portal')
  async createPropertyRequest(
    @Body(new ValidationPipe({ transform: true })) dto: any,
    @Req() req: any,
  ): Promise<Property> {
    const userId = this.extractUserId(req);
    return this.propertyService.createPropertyRequest(dto, userId);
  }

  /**
   * Get basic property information by ID (title, price, type, creator user)
   */
  @Get(':id/basic')
  @UseGuards(JwtAuthGuard)
  @Audit(AuditAction.READ, AuditEntityType.PROPERTY, 'Basic property info retrieved')
  async getBasicPropertyInfo(@Param('id') propertyId: string) {
    return this.propertyService.getBasicPropertyInfo(propertyId);
  }

  /**
   * Get property header information by ID (title, status)
   */
  @Get(':id/header')
  @UseGuards(JwtAuthGuard)
  @Audit(AuditAction.READ, AuditEntityType.PROPERTY, 'Property header info retrieved')
  async getPropertyHeaderInfo(@Param('id') propertyId: string) {
    return this.propertyService.getPropertyHeaderInfo(propertyId);
  }

  @Get(':id/characteristics')
  @UseGuards(JwtAuthGuard)
  @Audit(AuditAction.READ, AuditEntityType.PROPERTY, 'Property characteristics retrieved')
  async getPropertyCharacteristics(@Param('id') propertyId: string) {
    return this.propertyService.getPropertyCharacteristics(propertyId);
  }

  @Roles(UserRole.ADMIN, UserRole.AGENT, UserRole.COMMUNITY)
  @Post(':id/multimedia')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files', 20, propertyMediaUploadOptions(20)))
  @Audit(AuditAction.CREATE, AuditEntityType.MULTIMEDIA, 'Multimedia uploaded to property')
  async uploadMultimedia(
    @Param('id') propertyId: string,
    @Body(new ValidationPipe({ transform: true })) dto: UploadPropertyMultimediaDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: any,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No se recibieron archivos');
    }

    try {
      assertPropertyMediaSizes(files);
      await this.assertCanManagePropertyMedia(propertyId, req.user);

      const userId = this.extractUserId(req);
      const uploadedMultimedia = await this.propertyService.uploadMultimedia(propertyId, files, dto, userId);

      return {
        message: 'Multimedia uploaded successfully',
        data: uploadedMultimedia
      };
    } finally {
      await removeUploadedTempFiles(files);
    }
  }

  @Get(':id/location')
  @UseGuards(JwtAuthGuard)
  @Audit(AuditAction.READ, AuditEntityType.PROPERTY, 'Property location retrieved')
  async getPropertyLocation(@Param('id') propertyId: string) {
    return this.propertyService.getPropertyLocation(propertyId);
  }

  @Get(':id/multimedia')
  @UseGuards(JwtAuthGuard)
  @Audit(AuditAction.READ, AuditEntityType.PROPERTY, 'Property multimedia retrieved')
  async getPropertyMultimedia(@Param('id') propertyId: string) {
    return this.propertyService.getPropertyMultimedia(propertyId);
  }

  @Get(':id/history')
  @UseGuards(JwtAuthGuard)
  @Audit(AuditAction.READ, AuditEntityType.PROPERTY, 'Property history retrieved')
  async getPropertyHistory(@Param('id') propertyId: string) {
    const history = await this.propertyService.getPropertyHistory(propertyId);
    return { data: history };
  }

  @Roles(UserRole.ADMIN, UserRole.AGENT, UserRole.COMMUNITY)
  @Patch(':id/toggle-favorite')
  @ApiOperation({ summary: 'Toggle property favorite for user' })
  @ApiResponse({ status: 200, description: 'Favorite toggled', schema: { example: { isFavorited: true } } })
  @ApiParam({ name: 'id', type: String, description: 'Property ID' })
  @ApiBearerAuth()
  @Audit(AuditAction.UPDATE, AuditEntityType.PROPERTY, 'Property favorite toggled')
  async toggleFavorite(
    @Param('id') propertyId: string,
    @Req() req: any,
  ) {
    // El usuario sale SIEMPRE del token; un `userId` en el body se ignora.
    const result = await this.propertyService.toggleFavorite(propertyId, req.user.id);
    return {
      isFavorited: result.isFavorited,
    };
  }

  @Roles(UserRole.ADMIN, UserRole.AGENT, UserRole.COMMUNITY)
  @Get(':id/favorite-status')
  @ApiOperation({ summary: 'Check if property is favorited by user' })
  @ApiResponse({ status: 200, description: 'Favorite status', schema: { example: { isFavorited: true } } })
  @ApiParam({ name: 'id', type: String, description: 'Property ID' })
  @Audit(AuditAction.READ, AuditEntityType.PROPERTY, 'Property favorite status checked')
  async getFavoriteStatus(
    @Param('id') propertyId: string,
    @Req() req: any,
  ) {
    const userId = this.extractUserId(req) || 'anonymous';
    const isFavorited = await this.propertyService.isFavorited(propertyId, userId);
    return {
      isFavorited,
    };
  }

  /**
   * Get property by ID - GENERIC ENDPOINT (MUST BE LAST to not interfere with specific routes)
   */
  @Post(':id/share')
  @ApiOperation({ summary: 'Email the public property page to a recipient' })
  @ApiResponse({ status: 200, description: 'Share email sent' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: SharePropertyDto })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  @Audit(AuditAction.CREATE, AuditEntityType.PROPERTY, 'Property shared by email')
  async shareProperty(
    @Param('id') id: string,
    @Body(new ValidationPipe({ transform: true })) dto: SharePropertyDto,
    @Req() req: any,
  ) {
    const userId = this.extractUserId(req);
    return this.propertyService.shareByEmail(id, dto, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get property by ID' })
  @ApiResponse({ status: 200, description: 'Property details', type: Property })
  @ApiResponse({ status: 404, description: 'Property not found' })
  @ApiParam({ name: 'id', type: String, description: 'Property ID' })
  @Audit(AuditAction.READ, AuditEntityType.PROPERTY, 'Property viewed')
  findOne(@Param('id') id: string) {
    return this.propertyService.findOne(id);
  }

  @Roles(UserRole.ADMIN, UserRole.AGENT, UserRole.COMMUNITY)
  @Get('user/:userId/grid')
  @ApiOperation({ summary: 'Get properties grid for a specific user' })
  @ApiResponse({ status: 200, description: 'Grid of user properties' })
  @ApiParam({ name: 'userId', type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sort', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'operationType', required: false, enum: PropertyOperationType })
  @Audit(AuditAction.READ, AuditEntityType.PROPERTY, 'User properties grid viewed')
  gridByUser(
    @Param('userId') userId: string,
    @Query(ValidationPipe) query: GridSaleQueryDto & { operationType?: PropertyOperationType },
    @Req() req: any,
  ) {
    if (!isStaffRole(req.user?.role) && req.user?.id !== userId) {
      throw new ForbiddenException('No puedes ver las propiedades de otro usuario');
    }
    return this.propertyService.gridByUser(userId, query);
  }

  /**
   * ADMIN/AGENT pueden subir multimedia a cualquier propiedad; COMMUNITY solo a las
   * propiedades que creó (flujo "publicar/arrendar" del portal). Si se rechaza, se
   * eliminan los archivos que multer ya escribió en disco.
   */
  private async assertCanManagePropertyMedia(
    propertyId: string,
    user: { id?: string; role?: UserRole } | undefined,
  ): Promise<void> {
    if (isStaffRole(user?.role)) return;
    const property = await this.propertyService.findOne(propertyId, false);
    if (!user?.id || property?.creatorUserId !== user.id) {
      throw new ForbiddenException('No puedes modificar una propiedad que no es tuya');
    }
  }

  private extractUserId(req: any): string {
    const user = req.user as any;
    if (user?.id) return user.id;
    if (user?.sub) return user.sub;
    if (typeof user === 'string') return user;
    return 'system';
  }
}
