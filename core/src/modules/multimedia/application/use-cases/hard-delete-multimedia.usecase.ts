import { Injectable, NotFoundException } from '@nestjs/common';
import { MultimediaRepository } from '../../domain/multimedia.repository';
import {
  HistoryContext,
  appendPropertyHistory,
  eventEntry,
} from '../../../property/application/property-history';

@Injectable()
export class HardDeleteMultimediaUseCase {
  constructor(private readonly repo: MultimediaRepository) {}

  async execute(id: string, historyContext?: HistoryContext) {
    const m = await this.repo.findOne({ where: { id } });
    if (!m) throw new NotFoundException('Archivo multimedia no encontrado');
    await this.repo.remove(m);

    // Si era multimedia de una propiedad, queda constancia en su historial.
    if (m.propertyId && historyContext) {
      const manager = this.repo.createQueryBuilder('m').connection.manager;
      await appendPropertyHistory(manager, m.propertyId, [
        eventEntry(
          {
            field: 'multimedia',
            kind: 'MEDIA',
            previousValue: m.filename || 'Archivo',
            newValue: null,
            section: 'Multimedia',
          },
          historyContext,
        ),
      ]);
    }
  }
}
