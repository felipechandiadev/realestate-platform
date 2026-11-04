import { DUPLICATE_NAME_MESSAGE, isDuplicateKeyError } from './property-type-name';
import {
  Injectable,
  NotFoundException,
  ConflictException,
  HttpException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import {
  CreatePropertyTypeDto,
  UpdatePropertyTypeDto,
  UpdatePropertyTypeFeaturesDto,
} from '../dto/property-type.dto';
import { CreatePropertyTypeUseCase } from './use-cases/create-property-type.usecase';
import { FindAllPropertyTypesUseCase } from './use-cases/find-all-property-types.usecase';
import { FindAllPropertyTypesMinimalUseCase } from './use-cases/find-all-property-types-minimal.usecase';
import { FindAllPropertyTypesWithFeaturesUseCase } from './use-cases/find-all-property-types-with-features.usecase';
import { FindPropertyTypeUseCase } from './use-cases/find-property-type.usecase';
import { UpdatePropertyTypeUseCase } from './use-cases/update-property-type.usecase';
import { SoftDeletePropertyTypeUseCase } from './use-cases/soft-delete-property-type.usecase';
import { UpdatePropertyTypeFeaturesUseCase } from './use-cases/update-property-type-features.usecase';

@Injectable()
export class PropertyTypesService {
  private readonly logger = new Logger(PropertyTypesService.name);

  constructor(
    private readonly createUseCase: CreatePropertyTypeUseCase,
    private readonly findAllUseCase: FindAllPropertyTypesUseCase,
    private readonly findAllMinimalUseCase: FindAllPropertyTypesMinimalUseCase,
    private readonly findAllWithFeaturesUseCase: FindAllPropertyTypesWithFeaturesUseCase,
    private readonly findUseCase: FindPropertyTypeUseCase,
    private readonly updateUseCase: UpdatePropertyTypeUseCase,
    private readonly softDeleteUseCase: SoftDeletePropertyTypeUseCase,
    private readonly updateFeaturesUseCase: UpdatePropertyTypeFeaturesUseCase,
  ) {}

  async create(
    createPropertyTypeDto: CreatePropertyTypeDto,
  ) {
    try {
      return await this.createUseCase.execute(createPropertyTypeDto as any);
    } catch (err) {
      throw this.toHttpError(err);
    }
  }

  /**
   * Los errores HTTP pasan tal cual; "valor único repetido" de MySQL es "ya existe"; el resto
   * se deja subir (500) en vez de mostrar al usuario el texto técnico de la base.
   */
  private toHttpError(err: unknown): unknown {
    if (err instanceof HttpException) return err;
    if (isDuplicateKeyError(err)) return new ConflictException(DUPLICATE_NAME_MESSAGE);
    this.logger.error(`Error guardando un tipo de propiedad: ${err instanceof Error ? err.message : String(err)}`);
    return new InternalServerErrorException('No se pudo guardar el tipo de propiedad. Inténtalo de nuevo.');
  }

  async findAll(search?: string) {
    return await this.findAllUseCase.execute(search);
  }

  async findAllMinimal() {
    return await this.findAllMinimalUseCase.execute();
  }

  async findAllWithFeatures() {
    return await this.findAllWithFeaturesUseCase.execute();
  }

  async findOne(id: string) {
    const propertyType = await this.findUseCase.execute(id);
    if (!propertyType) {
      throw new NotFoundException('Tipo de propiedad no encontrado');
    }
    return propertyType;
  }

  async update(
    id: string,
    updatePropertyTypeDto: UpdatePropertyTypeDto,
  ) {
    try {
      return await this.updateUseCase.execute(id, updatePropertyTypeDto as any);
    } catch (err) {
      throw this.toHttpError(err);
    }
  }

  async softDelete(id: string) {
    await this.softDeleteUseCase.execute(id);
  }

  async updateFeatures(
    id: string,
    updateFeaturesDto: UpdatePropertyTypeFeaturesDto,
  ) {
    return await this.updateFeaturesUseCase.execute(id, updateFeaturesDto as any);
  }
}
