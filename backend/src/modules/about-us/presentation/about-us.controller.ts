import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Delete,
  Param,
  ValidationPipe,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { AboutUsService } from '../application/about-us.service';
import { CreateAboutUsDto, UpdateAboutUsDto } from '../dto/about-us.dto';
import { Audit } from '../../../shared/interceptors/audit.interceptor';
import { AuditAction, AuditEntityType } from '../../../shared/enums/audit.enums';

@Controller('about-us')
@ApiTags('About Us')
export class AboutUsController {
  private readonly logger = new Logger(AboutUsController.name);

  constructor(private readonly aboutUsService: AboutUsService) {}

  @Get()
  @ApiOperation({ summary: 'Get about us entries' })
  @ApiResponse({ status: 200, description: 'List of about us entries' })
  @Audit(AuditAction.READ, AuditEntityType.ABOUT_US, 'About us viewed')
  async findAll() {
    try {
      const result = await this.aboutUsService.findAll();
      this.logger.log('GetAll AboutUs - Found:', result.length);
      return result;
    } catch (error) {
      this.logger.error('Error fetching AboutUs:', error);
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error instanceof Error ? error.message : 'Error fetching AboutUs',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create about us information' })
  @ApiResponse({ status: 201, description: 'About us created successfully' })
  @Audit(AuditAction.CREATE, AuditEntityType.ABOUT_US, 'About us created')
  async create(@Body(ValidationPipe) createAboutUsDto: CreateAboutUsDto) {
    try {
      this.logger.log('Creating AboutUs with data:', createAboutUsDto);
      const result = await this.aboutUsService.create(createAboutUsDto);
      this.logger.log('AboutUs created successfully:', result.id);
      return result;
    } catch (error) {
      this.logger.error('Error creating AboutUs:', error);
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error instanceof Error ? error.message : 'Error creating AboutUs',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update about us information' })
  @ApiResponse({ status: 200, description: 'About us updated successfully' })
  @Audit(AuditAction.UPDATE, AuditEntityType.ABOUT_US, 'About us updated')
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateAboutUsDto: UpdateAboutUsDto,
  ) {
    try {
      this.logger.log('Updating AboutUs with id:', id, 'Data:', updateAboutUsDto);
      const result = await this.aboutUsService.updateById(id, updateAboutUsDto);
      this.logger.log('AboutUs updated successfully:', id);
      return result;
    } catch (error) {
      this.logger.error('Error updating AboutUs:', error);
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error instanceof Error ? error.message : 'Error updating AboutUs',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete about us information' })
  @ApiResponse({ status: 200, description: 'About us deleted successfully' })
  @Audit(AuditAction.DELETE, AuditEntityType.ABOUT_US, 'About us deleted')
  async softDelete(@Param('id') id: string) {
    try {
      await this.aboutUsService.softDeleteById(id);
      this.logger.log('AboutUs deleted successfully:', id);
      return { statusCode: 200, message: 'About us deleted successfully' };
    } catch (error) {
      this.logger.error('Error deleting AboutUs:', error);
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error instanceof Error ? error.message : 'Error deleting AboutUs',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get about us by id' })
  @ApiResponse({ status: 200, description: 'About us content' })
  @Audit(AuditAction.READ, AuditEntityType.ABOUT_US, 'About us viewed')
  async findOneById(@Param('id') id: string) {
    try {
      const result = await this.aboutUsService.findById(id);
      this.logger.log('GetOne AboutUs - Found:', id);
      return result;
    } catch (error) {
      this.logger.error('Error fetching AboutUs by id:', error);
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error instanceof Error ? error.message : 'Error fetching AboutUs',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
