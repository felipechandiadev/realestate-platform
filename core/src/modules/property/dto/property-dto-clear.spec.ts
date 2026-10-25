import { ValidationPipe } from '@nestjs/common';
import { UpdatePropertyBasicDto } from './update-property-basic.dto';
import { UpdatePropertyCharacteristicsDto } from './property.dto';
import { CreatePropertyDto } from './create-property.dto';

const pipe = new ValidationPipe({ transform: true, whitelist: true });

describe('DTOs de propiedad', () => {
  it('quitar el agente llega como null y pasa la validación', async () => {
    const dto = (await pipe.transform(
      { assignedAgentId: '' },
      { type: 'body', metatype: UpdatePropertyBasicDto },
    )) as UpdatePropertyBasicDto;
    expect(dto.assignedAgentId).toBeNull();
  });

  it('año de construcción vacío llega como null; ausente queda sin tocar', async () => {
    const cleared = (await pipe.transform(
      { constructionYear: '' },
      { type: 'body', metatype: UpdatePropertyCharacteristicsDto },
    )) as UpdatePropertyCharacteristicsDto;
    expect(cleared.constructionYear).toBeNull();
    const untouched = (await pipe.transform(
      { bedrooms: 2 },
      { type: 'body', metatype: UpdatePropertyCharacteristicsDto },
    )) as UpdatePropertyCharacteristicsDto;
    expect(untouched.constructionYear).toBeUndefined();
  });

  it('crear con estado "Contrato en progreso" ya no se convierte en Solicitud', async () => {
    const dto = (await pipe.transform(
      {
        title: 'Casa',
        status: 'CONTRACT-IN-PROGRESS',
        operationType: 'SALE',
        state: 'RM',
        city: 'Santiago',
      },
      { type: 'body', metatype: CreatePropertyDto },
    )) as CreatePropertyDto;
    expect(dto.status).toBe('CONTRACT-IN-PROGRESS');
  });
});
