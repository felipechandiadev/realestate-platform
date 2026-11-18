import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsArray, IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';
import { Roles } from '../../auth/presentation/decorators/roles.decorator';
import { UserRole } from '../../users/domain/user.entity';
import { AgentKeysService } from '../application/agent-keys.service';
import { AgentKey, AgentScope } from '../domain/agent-key.entity';

class CreateAgentKeyDto {
  @IsString()
  @MaxLength(80)
  name: string;

  @IsArray()
  @IsString({ each: true })
  scopes: AgentScope[];

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

const view = (k: AgentKey) => ({
  id: k.id,
  name: k.name,
  keyPrefix: k.keyPrefix,
  scopes: k.scopes,
  expiresAt: k.expiresAt,
  lastUsedAt: k.lastUsedAt,
  revokedAt: k.revokedAt,
  createdAt: k.createdAt,
});

/** Un admin crea y revoca las keys de sus agentes. Un agente no puede administrar keys. */
@ApiTags('Agent keys')
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
@Controller('agent-keys')
export class AgentKeysController {
  constructor(private readonly service: AgentKeysService) {}

  private assertHuman(req: any) {
    if (req.user?.agent) {
      throw new ForbiddenException('Un agente no puede administrar keys');
    }
  }

  @Post()
  @ApiOperation({ summary: 'Crea la key de un agente (se muestra una sola vez)' })
  async create(@Body() dto: CreateAgentKeyDto, @Req() req: any) {
    this.assertHuman(req);
    const { key, token } = await this.service.create({
      ownerId: req.user.id,
      name: dto.name,
      scopes: dto.scopes,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
    });
    return { ...view(key), token };
  }

  @Get()
  @ApiOperation({ summary: 'Lista las keys de agentes del admin' })
  async list(@Req() req: any) {
    this.assertHuman(req);
    return (await this.service.list(req.user.id)).map(view);
  }

  @Post(':id/revoke')
  @HttpCode(200)
  @ApiOperation({ summary: 'Revoca la key de un agente' })
  async revoke(@Param('id') id: string, @Req() req: any) {
    this.assertHuman(req);
    return view(await this.service.revoke(id, req.user));
  }
}
