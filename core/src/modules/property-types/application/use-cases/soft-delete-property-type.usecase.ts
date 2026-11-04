import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PropertyTypeRepository } from '../../domain/property-type.repository';
import { deletedNameFor } from '../property-type-name';

@Injectable()
export class SoftDeletePropertyTypeUseCase {
  constructor(private readonly repo: PropertyTypeRepository) {}

  async execute(id: string) {
    const propertyType = await this.repo.findOne({ where: { id } });
    if (!propertyType) {
      throw new NotFoundException('Tipo de propiedad no encontrado');
    }

    // Una propiedad sin tipo queda incompleta (no se puede editar ni filtrar bien):
    // primero hay que cambiarles el tipo.
    const inUse = await this.repo.countPropertiesUsing(id);
    if (inUse > 0) {
      throw new ConflictException(
        `No se puede eliminar "${propertyType.name}": ${inUse} ${inUse === 1 ? 'propiedad lo usa' : 'propiedades lo usan'}. ` +
          `${inUse === 1 ? 'Cámbiale' : 'Cámbiales'} el tipo antes de eliminarlo.`,
      );
    }

    // Se libera el nombre (es único también entre los eliminados) y se da de baja.
    await this.repo.update(id, { name: deletedNameFor(propertyType.name, id) });
    await this.repo.softDelete(id);
  }
}
