import { Module } from '@nestjs/common';
import { AgentMcpController } from './presentation/agent-mcp.controller';

@Module({ controllers: [AgentMcpController] })
export class AgentMcpModule {}
