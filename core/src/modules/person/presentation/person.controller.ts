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
} from '@nestjs/common';
import type { Response } from 'express';
import { RolesGuard } from '../../auth/presentation/guards/roles.guard';
import { Roles } from '../../auth/presentation/decorators/roles.decorator';
import { UserRole } from '../../users/domain/user.entity';
import { PersonService } from '../application/person.service';
import { CreatePersonDto, UpdatePersonDto } from '../dto/person.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('people')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('people')
export class PersonController {
  constructor(private readonly personService: PersonService) {}

  @Post()
  create(@Body() createPersonDto: CreatePersonDto) {
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.personService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePersonDto: UpdatePersonDto) {
    return this.personService.update(id, updatePersonDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.personService.remove(id);
  }
}
