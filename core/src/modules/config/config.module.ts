import { Module } from '@nestjs/common';
import { ConfigService } from './application/config.service';
import { ConfigController } from './presentation/config.controller';

@Module({
  providers: [ConfigService],
  controllers: [ConfigController],
})
export class ConfigModule {}