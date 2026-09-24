import { Injectable } from '@nestjs/common';
import { REGION_COMMUNES } from '../../../shared/regions/regions.data';
import { RegionEnum } from '../../../shared/regions/regions.enum';
import {
  CommuneOptionEntity,
  ConfigOptionEntity,
} from '../domain/config-option.entity';

@Injectable()
export class ConfigService {
  getRegions(): ConfigOptionEntity[] {
    return Object.values(RegionEnum).map(
      (value) => new ConfigOptionEntity(value, value),
    );
  }

  getCommunesByRegion(region: string): CommuneOptionEntity[] {
    if (!region || !REGION_COMMUNES[region as RegionEnum]) {
      return [];
    }

    return REGION_COMMUNES[region as RegionEnum].map(
      (comuna) => new CommuneOptionEntity(comuna, comuna, region),
    );
  }
}
