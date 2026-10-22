import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Res,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import type { Response } from 'express';
import { RolesGuard } from '../../auth/presentation/guards/roles.guard';
import { Roles } from '../../auth/presentation/decorators/roles.decorator';
import { UserRole } from '../../users/domain/user.entity';
import { PersonService } from '../application/person.service';
import { CreatePersonDto, UpdatePersonDto } from '../dto/person.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

const isCommunity = (user?: { role?: string }): boolean =>
  user?.role === UserRole.COMMUNITY;

/** Campos que un usuario COMMUNITY no puede fijar sobre su ficha. */
function stripCommunityPersonFields<T extends object>(dto: T): Partial<T> {
  const clean = { ...dto } as Record<string, unknown>;
  delete clean.verified;
  delete clean.verificationRequest;
  delete clean.userId;
  return clean as Partial<T>;
}

@ApiTags('people')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Roles(UserRole.ADMIN, UserRole.AGENT)
@Controller('people')
export class PersonController {
  constructor(private readonly personService: PersonService) {}

  // COMMUNITY (portal) puede crear SU ficha: userId forzado al token.
  @Roles(UserRole.ADMIN, UserRole.AGENT, UserRole.COMMUNITY)
  @Post()
  create(@Body() createPersonDto: CreatePersonDto, @Req() req: any) {
    if (isCommunity(req.user)) {
      return this.personService.create({
        ...stripCommunityPersonFields(createPersonDto),
        userId: req.user.id,
      } as CreatePersonDto);
    }
    return this.personService.create(createPersonDto);
  }

  @Get('search')
  searchPersons() {
    return this.personService.getPersonsForSearch();
  }

  @Get()
  findAll() {
    return this.personService.findAll();
  }

  @Get('all')
  findAllIncludingUsers(@Query() query: Record<string, string | undefined>) {
    const wantsGrid = Boolean(
      query?.page || query?.sort || query?.sortField || query?.filters || query?.search || query?.pagination,
    );
    if (wantsGrid) {
      return this.personService.findGrid(query);
    }
    return this.personService.findAllIncludingUsers();
  }

  @Get('excel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  @ApiBearerAuth()
  async exportExcel(@Query() query: Record<string, string | undefined>, @Res() res: Response) {
    const buffer = await this.personService.exportExcel(query);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="personas.xlsx"',
    });
    res.send(buffer);
  }

  @Post(':id/verify')
  async verify(@Param('id') id: string) {
    return this.personService.verify(id);
  }

  @Post(':id/unverify')
  async unverify(@Param('id') id: string) {
    return this.personService.unverify(id);
  }

  @Post(':id/request-verification')
  async requestVerification(@Param('id') id: string) {
    return this.personService.requestVerification(id);
  }

  @Post(':id/link-user')
  async linkUser(@Param('id') id: string, @Body() dto: { userId: string }) {
    return this.personService.linkUser(id, dto.userId);
  }

  @Post(':id/unlink-user')
  async unlinkUser(@Param('id') id: string) {
    return this.personService.unlinkUser(id);
  }

  // COMMUNITY solo su propia ficha.
  @Roles(UserRole.ADMIN, UserRole.AGENT, UserRole.COMMUNITY)
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    await this.assertCommunityOwnsPerson(id, req.user);
    return this.personService.findOne(id);
  }

  // COMMUNITY solo su propia ficha y sin tocar verificación/vínculo.
  @Roles(UserRole.ADMIN, UserRole.AGENT, UserRole.COMMUNITY)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePersonDto: UpdatePersonDto,
    @Req() req: any,
  ) {
    if (isCommunity(req.user)) {
      await this.assertCommunityOwnsPerson(id, req.user);
      return this.personService.update(
        id,
        stripCommunityPersonFields(updatePersonDto) as UpdatePersonDto,
      );
    }
    return this.personService.update(id, updatePersonDto);
  }

  private async assertCommunityOwnsPerson(
    id: string,
    user: { id?: string; role?: string } | undefined,
  ): Promise<void> {
    if (!isCommunity(user)) return;
    const owned = await this.personService.isOwnedByUser(id, user!.id as string);
    if (!owned) {
      throw new ForbiddenException('No puedes acceder a la ficha de otra persona');
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.personService.remove(id);
  }
}
