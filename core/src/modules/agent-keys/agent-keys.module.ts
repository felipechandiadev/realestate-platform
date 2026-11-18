import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/domain/user.entity';
import { AgentKeysService } from './application/agent-keys.service';
import { AgentKeysController } from './presentation/agent-keys.controller';
import { AgentKey } from './domain/agent-key.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AgentKey, User])],
  controllers: [AgentKeysController],
  providers: [AgentKeysService],
  exports: [AgentKeysService],
})
export class AgentKeysModule {}
