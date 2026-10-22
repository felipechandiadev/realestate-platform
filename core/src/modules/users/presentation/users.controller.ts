import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
  HttpCode,
  UseGuards,
  Query,
  Res,
  Put,
  UseInterceptors,
  Req,
  UploadedFile,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { DEFAULT_UPLOAD_OPTIONS } from '../../../shared/upload/upload-limits';
import type { Response } from 'express';
import { UsersService } from '../application/users.service';
import {
  CreateUserDto,
  UpdateUserDto,
  LoginDto,
  ChangePasswordDto,
  ResetPasswordDto,
  AssignRoleDto,
  UpdatePermissionsDto,
  ListAdminUsersQueryDto,
} from '../dto/user.dto';
import { UpdateAvatarDto } from '../dto/update-avatar.dto';
import { UserProfileResponseDto } from '../dto/user-profile-response.dto';
import { GridCommunityUsersQueryDto } from '../dto/grid-community-users.dto';
import { UserStatus, UserRole, Permission } from '../domain/user.entity';
import { JwtAuthGuard, RolesGuard, Roles } from '../../auth/guards/jwt-auth.guard';
import {
  assertSelfOrRoles,
  sanitizeUserUpdateForActor,
} from './user-access.util';

const STAFF = [UserRole.ADMIN, UserRole.AGENT];

@Controller('users')
@ApiTags('Users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    /**
     * Create a new user account
     * Only available to authenticated admins/system
     */
    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.AGENT)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new user' })
    @ApiResponse({
      status: 201,
      description: 'User created successfully',
    })
    @ApiResponse({
      status: 400,
      description: 'Validation error - invalid email or missing required fields',
    })
    @ApiBody({ type: CreateUserDto })
    async create(
      @Body(ValidationPipe) createUserDto: CreateUserDto,
      @Req() req?: any,
    ) {
      if (createUserDto.role === UserRole.ADMIN && req?.user?.role !== UserRole.ADMIN) {
        throw new ForbiddenException('Solo un ADMIN puede crear administradores');
      }
      const user = await this.usersService.create(createUserDto);
      const { password, setPassword, validatePassword, ...userResponse } =
        user as any;
      return userResponse;
    }

    /**
     * Get all users (with optional filters)
     */
    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.AGENT)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all users' })
    @ApiResponse({
      status: 200,
      description: 'List of all users',
    })
    findAll() {
      return this.usersService.findAll();
    }

    /**
     * List admin users with search and pagination
     */
    @Get('admins')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get list of admin users' })
    @ApiResponse({
      status: 200,
      description: 'Paginated list of admin users',
    })
    @ApiQuery({ name: 'search', required: false, description: 'Search by name or email' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    listAdmins(@Query(ValidationPipe) filters: ListAdminUsersQueryDto) {
      return this.usersService.findAdminUsers(filters);
    }

    @Get('admins/excel')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    async exportAdminsExcel(@Query() query: Record<string, string | undefined>, @Res() res: Response) {
      const buffer = await this.usersService.exportAdminsExcel(query);
      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="administradores.xlsx"',
      });
      res.send(buffer);
    }

    /**
     * Get current user's profile
     * Requires authentication
     */
    @Get('profile')
    @ApiOperation({ summary: 'Get current user profile' })
    @ApiResponse({
      status: 200,
      description: 'Current user profile details',
      type: UserProfileResponseDto,
    })
    @ApiResponse({
      status: 401,
      description: 'Unauthorized - invalid or missing token',
    })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async getProfile(@Req() req: any): Promise<UserProfileResponseDto> {
      const userId = req.user.id;
      return this.usersService.getUserProfile(userId);
    }

    /**
     * List admins and agents with search and pagination
     */
    @Get('admins-agents')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.AGENT)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get list of admins and agents' })
    @ApiResponse({
      status: 200,
      description: 'Paginated list of admins and agents',
    })
    @ApiQuery({ name: 'search', required: false })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    async listAdminsAgents(
      @Query('search') search?: string,
      @Query('page') page?: number,
      @Query('limit') limit?: number,
    ) {
      return this.usersService.listAdminsAgents({
        search,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });
    }

    /**
     * List agent users with search and pagination
     */
    @Get('agents')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.AGENT)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get list of agent users' })
    @ApiResponse({
      status: 200,
      description: 'Paginated list of agent users',
    })
    @ApiQuery({ name: 'search', required: false })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    async listAgents(
      @Query('search') search?: string,
      @Query('page') page?: number,
      @Query('limit') limit?: number,
      @Query('sort') sort?: string,
      @Query('sortField') sortField?: string,
      @Query('filters') filters?: string,
      @Query('filtration') filtration?: string,
      @Query('pagination') pagination?: string,
      @Query('status') status?: string,
    ) {
      return this.usersService.listAgents({
        search,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        sort,
        sortField,
        filters,
        filtration,
        pagination,
        status,
      });
    }

    @Get('agents/excel')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.AGENT)
    @ApiBearerAuth()
    async exportAgentsExcel(@Query() query: Record<string, string | undefined>, @Res() res: Response) {
      const buffer = await this.usersService.exportAgentsExcel(query);
      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="agentes.xlsx"',
      });
      res.send(buffer);
    }

    /**
     * Get community users grid with pagination, search, and filtering
     * Follows the same pattern as properties grid
     */
    @Get('grid/community')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.AGENT)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get community users grid with pagination and filters' })
    @ApiResponse({
      status: 200,
      description: 'Paginated grid of community users',
    })
    @ApiQuery({ name: 'fields', required: false, description: 'Comma-separated fields to include' })
    @ApiQuery({ name: 'sort', required: false, enum: ['asc', 'desc'], description: 'Sort direction' })
    @ApiQuery({ name: 'sortField', required: false, description: 'Field to sort by' })
    @ApiQuery({ name: 'search', required: false, description: 'Global text search' })
    @ApiQuery({ name: 'filtration', required: false, description: 'Enable column filters (true/false)' })
    @ApiQuery({ name: 'filters', required: false, description: 'Column filters (e.g., "status-ACTIVE,email-test@example.com")' })
    @ApiQuery({ name: 'pagination', required: false, description: 'Enable pagination (true/false)' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    gridCommunityUsers(@Query(ValidationPipe) query: GridCommunityUsersQueryDto) {
      return this.usersService.gridCommunityUsers(query);
    }

    @Get('grid/community/excel')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.AGENT)
    @ApiBearerAuth()
    async exportCommunityExcel(@Query() query: Record<string, string | undefined>, @Res() res: Response) {
      const buffer = await this.usersService.exportCommunityExcel(query);
      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="comunidad.xlsx"',
      });
      res.send(buffer);
    }

    /**
     * Get favorite properties with full details
     */
    @Get(':id/favorites/details')
    @ApiOperation({ summary: 'Get favorite properties with details' })
    @ApiResponse({ status: 200, description: 'List of favorite properties with details' })
    @ApiParam({ name: 'id', type: String })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async getFavoriteProperties(@Param('id') id: string, @Req() req: any) {
      assertSelfOrRoles(req.user, id, STAFF);
      return this.usersService.getUserFavoriteProperties(id);
    }

    /**
     * Get user by ID
     */
    @Get(':id')
    @ApiOperation({ summary: 'Get user by ID' })
    @ApiResponse({ status: 200, description: 'User details' })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiParam({ name: 'id', type: String })
    @ApiBearerAuth()
    findOne(@Param('id') id: string, @Req() req: any) {
      assertSelfOrRoles(req.user, id, STAFF);
      return this.usersService.findOne(id);
    }

    /**
     * Get public profile of a user by ID
     */
    @Get(':id/profile')
    @ApiOperation({ summary: 'Get user profile by ID' })
    @ApiResponse({ status: 200, description: 'User profile details', type: UserProfileResponseDto })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiParam({ name: 'id', type: String })
    @ApiBearerAuth()
    getUserProfileById(@Param('id') id: string, @Req() req: any) {
      assertSelfOrRoles(req.user, id, STAFF);
      return this.usersService.getUserProfile(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update user details' })
    @ApiResponse({ status: 200, description: 'User updated successfully' })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiParam({ name: 'id', type: String })
    @ApiBody({ type: UpdateUserDto })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async update(
      @Param('id') id: string,
      @Body(ValidationPipe) updateUserDto: UpdateUserDto,
      @Req() req: any,
    ) {
      // Dueño o ADMIN. Un no-ADMIN no puede cambiar rol/estado/permisos.
      assertSelfOrRoles(req.user, id, [UserRole.ADMIN]);
      const dto = sanitizeUserUpdateForActor(req.user, updateUserDto);
      if (req.user?.role !== UserRole.ADMIN && dto.personId) {
        await this.usersService.assertPersonLinkableByUser(dto.personId, id);
      }
      return this.usersService.update(id, dto);
    }

    @Patch(':id/status')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Update user account status' })
    @ApiResponse({ status: 200, description: 'Status updated' })
    @ApiParam({ name: 'id', type: String })
    @ApiBody({ schema: { example: { status: 'ACTIVE' } } })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    setStatus(
      @Param('id') id: string,
      @Body('status', ValidationPipe) status: UserStatus,
    ) {
      return this.usersService.setStatus(id, status);
    }

    /**
     * Assign role to user (USER, AGENT, ADMIN, SUPERADMIN)
     */
    @Patch(':id/role')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Assign role to user' })
    @ApiResponse({ status: 200, description: 'Role assigned successfully' })
    @ApiParam({ name: 'id', type: String })
    @ApiBody({ type: AssignRoleDto })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    assignRole(
      @Param('id') id: string,
      @Body(ValidationPipe) assignRoleDto: AssignRoleDto,
    ) {
      return this.usersService.assignRole(id, assignRoleDto.role);
    }

    /**
     * Update user permissions
     */
    @Patch(':id/permissions')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Update user permissions' })
    @ApiResponse({ status: 200, description: 'Permissions updated successfully' })
    @ApiParam({ name: 'id', type: String })
    @ApiBody({ type: UpdatePermissionsDto })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    setPermissions(
      @Param('id') id: string,
      @Body(ValidationPipe) updatePermissionsDto: UpdatePermissionsDto,
    ) {
      return this.usersService.setPermissions(
        id,
        updatePermissionsDto.permissions,
      );
    }

    /**
     * Change user password
     */
    @Patch(':id/change-password')
    @ApiOperation({ summary: 'Change user password' })
    @ApiResponse({ status: 200, description: 'Password changed successfully' })
    @ApiResponse({ status: 401, description: 'Invalid current password' })
    @ApiParam({ name: 'id', type: String })
    @ApiBody({ type: ChangePasswordDto })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @HttpCode(200)
    async changePassword(
      @Param('id') id: string,
      @Body() changePasswordDto: ChangePasswordDto,
      @Req() req: any,
    ): Promise<void> {
      assertSelfOrRoles(req.user, id, [UserRole.ADMIN]);
      await this.usersService.changePassword(id, changePasswordDto);
    }

    @Patch(':id/reset-password')
    @ApiOperation({ summary: 'Reset a user password (admin)' })
    @ApiResponse({ status: 200, description: 'Password reset successfully' })
    @ApiParam({ name: 'id', type: String })
    @ApiBody({ type: ResetPasswordDto })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(200)
    async resetPassword(
      @Param('id') id: string,
      @Body(ValidationPipe) dto: ResetPasswordDto,
    ): Promise<void> {
      await this.usersService.resetPassword(id, dto.newPassword);
    }

    /**
     * Soft delete user (marks as deleted without removing from DB)
     */
    @Delete(':id')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Delete user account' })
    @ApiResponse({ status: 200, description: 'User deleted successfully' })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiParam({ name: 'id', type: String })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    softDelete(@Param('id') id: string) {
      return this.usersService.softDelete(id);
    }

    /**
     * Update user avatar/profile picture
     * Accepts multipart file upload
     */
    @Put(':id/avatar')
    @ApiOperation({ summary: 'Update user avatar' })
    @ApiResponse({ status: 200, description: 'Avatar updated successfully', type: UpdateAvatarDto })
    @ApiResponse({ status: 400, description: 'Invalid file format' })
    @ApiParam({ name: 'id', type: String })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
      schema: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file', DEFAULT_UPLOAD_OPTIONS))
    async updateUserAvatar(
      @Param('id') id: string,
      @UploadedFile() file: Express.Multer.File,
      @Req() req: any,
    ): Promise<UpdateAvatarDto> {
      assertSelfOrRoles(req.user, id, [UserRole.ADMIN]);
      const user = await this.usersService.updateUserAvatar(id, file);
      return { avatarUrl: user.personalInfo?.avatarUrl };
    }
  }
