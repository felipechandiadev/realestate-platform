import { Controller, Get, Query } from '@nestjs/common';
import { ConfigService } from '../application/config.service';

@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get('regiones')
  getRegiones() {
    return this.configService.getRegions();
  }

  @Get('comunas')
  getComunasByRegion(@Query('region') region: string) {
    return this.configService.getCommunesByRegion(region);
  }
}