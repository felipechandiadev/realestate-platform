import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
  Inject,
  Optional,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
import { SessionUserService } from '../../auth/application/session-user.service';
import { ContractOrmEntity } from '../../contracts/infrastructure/persistence/contract.orm-entity';
import { assertAccountChangeAllowed, type AccountChange } from './user-account-rules';
import * as bcrypt from 'bcrypt';
import * as ExcelJS from 'exceljs';
import {
  User,
  UserStatus,
  UserRole,
  Permission,
} from '../domain/user.entity';
import { UserRepository } from '../domain/user.repository';
import { CreateUserUseCase } from './use-cases/create-user.usecase';
import { FindAllUsersUseCase } from './use-cases/find-all-users.usecase';
import { FindAdminUsersUseCase } from './use-cases/find-admin-users.usecase';
import { FindUserUseCase } from './use-cases/find-user.usecase';
import { UpdateUserUseCase } from './use-cases/update-user.usecase';
import { SoftDeleteUserUseCase } from './use-cases/soft-delete-user.usecase';
import { LoginUseCase } from './use-cases/login.usecase';
import { AssignRoleUseCase } from './use-cases/assign-role.usecase';
import { SetPermissionsUseCase } from './use-cases/set-permissions.usecase';
import { ChangePasswordUseCase } from './use-cases/change-password.usecase';
import { ResetPasswordUseCase } from './use-cases/reset-password.usecase';
import { SetStatusUseCase } from './use-cases/set-status.usecase';
import { GetProfileUseCase } from './use-cases/get-profile.usecase';
import { ListAdminsAgentsUseCase } from './use-cases/list-admins-agents.usecase';
import { ListAgentsUseCase } from './use-cases/list-agents.usecase';
import { UpdateUserAvatarUseCase } from './use-cases/update-user-avatar.usecase';
import { GetUserFavoritesUseCase } from './use-cases/get-user-favorites.usecase';
import { CheckPropertyFavoriteUseCase } from './use-cases/check-property-favorite.usecase';
import { CreateCommunityUserUseCase } from './use-cases/create-community-user.usecase';
import { VerifyUserEmailUseCase } from './use-cases/verify-user-email.usecase';
import { ResendVerificationEmailUseCase } from './use-cases/resend-verification-email.usecase';
import { GridCommunityUsersUseCase } from './use-cases/grid-community-users.usecase';
import { Person } from '../../person/domain/person.entity';
import { PersonOrmEntity } from '../../person/infrastructure/persistence/person.orm-entity';
import { Property } from '../../property/domain/property.entity';
import {
  CreateUserDto,
  UpdateUserDto,
  LoginDto,
  ChangePasswordDto,
  ListAdminUsersQueryDto,
} from '../dto/user.dto';
import { UpdateAvatarDto } from '../dto/update-avatar.dto';
import { UserProfileResponseDto } from '../dto/user-profile-response.dto';
import { GridCommunityUsersQueryDto } from '../dto/grid-community-users.dto';
import { AuditService } from '../../audit/application/audit.service';
import { AuditAction, AuditEntityType } from '../../../shared/enums/audit.enums';
import { UserFavoriteData } from '../../../shared/interfaces/user-favorites.interface';
import { plainToInstance } from 'class-transformer';
import { ConfigService } from '@nestjs/config';
import { MultimediaService } from '../../multimedia/application/multimedia.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(PersonOrmEntity)
    private readonly personRepository: Repository<PersonOrmEntity>,
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    @Inject(AuditService)
    private readonly auditService: AuditService,
    private readonly configService: ConfigService,
    private readonly multimediaService: MultimediaService,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly findAllUsersUseCase: FindAllUsersUseCase,
    private readonly findAdminUsersUseCase: FindAdminUsersUseCase,
    private readonly findUserUseCase: FindUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly softDeleteUserUseCase: SoftDeleteUserUseCase,
    private readonly loginUserUseCase: LoginUseCase,
    private readonly assignRoleUseCase: AssignRoleUseCase,
    private readonly setPermissionsUseCase: SetPermissionsUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly setStatusUseCase: SetStatusUseCase,
    private readonly getProfileUseCase: GetProfileUseCase,
    private readonly listAdminsAgentsUseCase: ListAdminsAgentsUseCase,
    private readonly listAgentsUseCase: ListAgentsUseCase,
    private readonly updateUserAvatarUseCase: UpdateUserAvatarUseCase,
    private readonly getUserFavoritesUseCase: GetUserFavoritesUseCase,
    private readonly checkPropertyFavoriteUseCase: CheckPropertyFavoriteUseCase,
    private readonly createCommunityUserUseCase: CreateCommunityUserUseCase,
    private readonly verifyUserEmailUseCase: VerifyUserEmailUseCase,
    private readonly resendVerificationEmailUseCase: ResendVerificationEmailUseCase,
    private readonly gridCommunityUsersUseCase: GridCommunityUsersUseCase,
    @Optional()
    @Inject(forwardRef(() => SessionUserService))
    private readonly sessionUsers?: SessionUserService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    return this.createUserUseCase.execute(createUserDto);
  }

  async findAll(): Promise<User[]> {
    return this.findAllUsersUseCase.execute();
  }

  async findAdminUsers(filters: ListAdminUsersQueryDto): Promise<any> {
    return this.findAdminUsersUseCase.execute(filters);
  }

  async findOne(id: string): Promise<User> {
    return this.findUserUseCase.execute(id);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    return this.updateUserUseCase.execute(id, updateUserDto);
  }

  /**
   * Un usuario no-ADMIN solo puede vincularse a una ficha de persona que ya le
   * pertenece (person.userId === userId) o a la que ya tiene vinculada.
   */
  async assertPersonLinkableByUser(personId: string, userId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user?.personId === personId) return;
    const person = await this.personRepository.findOne({ where: { id: personId } });
    if (!person) {
      throw new NotFoundException('Persona no encontrada');
    }
    if (person.userId !== userId) {
      throw new ForbiddenException('No puedes vincular una persona que no te pertenece');
    }
  }

  async softDelete(id: string, actorId?: string): Promise<void> {
    await this.guardAccountChange(id, { kind: 'delete' }, actorId);
    await this.softDeleteUserUseCase.execute(id);
    this.sessionUsers?.invalidate(id);
  }

  /** Aplica `assertAccountChangeAllowed` con los datos actuales del usuario. */
  private async guardAccountChange(id: string, change: AccountChange, actorId?: string): Promise<void> {
    const target = await this.userRepository.findOne({
      where: { id, deletedAt: IsNull() },
      select: { id: true, role: true, status: true },
    });
    if (!target) throw new NotFoundException('Usuario no encontrado');

    const [otherActiveAdmins, assignedProperties, activeContracts] = await Promise.all([
      this.userRepository.count({
        where: { id: Not(id), role: UserRole.ADMIN, status: UserStatus.ACTIVE, deletedAt: IsNull() },
      }),
      this.propertyRepository.count({ where: { assignedAgentId: id, deletedAt: IsNull() } }),
      this.userRepository.manager.count(ContractOrmEntity, {
        where: { userId: id, status: 'IN_PROCESS', deletedAt: IsNull() },
      }),
    ]);

    assertAccountChangeAllowed(change, {
      actorId,
      target: { id: target.id, role: target.role, status: target.status },
      otherActiveAdmins,
      assignedProperties,
      activeContracts,
    });
  }

  async login(loginDto: LoginDto): Promise<any> {
    return this.loginUserUseCase.execute(loginDto);
  }

  async assignRole(id: string, role: UserRole, actorId?: string): Promise<any> {
    await this.guardAccountChange(id, { kind: 'role', role }, actorId);
    const updated = await this.assignRoleUseCase.execute(id, role);
    this.sessionUsers?.invalidate(id);
    return updated;
  }

  async setPermissions(id: string, permissions: Permission[]): Promise<any> {
    return this.setPermissionsUseCase.execute(id, permissions);
  }

  async changePassword(
    id: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    return this.changePasswordUseCase.execute(id, changePasswordDto);
  }

  async resetPassword(id: string, newPassword: string): Promise<void> {
    return this.resetPasswordUseCase.execute(id, { newPassword });
  }

  async setStatus(id: string, status: UserStatus, actorId?: string): Promise<User> {
    await this.guardAccountChange(id, { kind: 'status', status }, actorId);
    const updated = await this.setStatusUseCase.execute(id, status);
    this.sessionUsers?.invalidate(id);
    return updated;
  }

  async getUserProfile(userId: string): Promise<UserProfileResponseDto> {
    return this.getProfileUseCase.execute(userId);
  }

  async listAdminsAgents(params: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: User[]; total: number; page: number; limit: number }> {
    return this.listAdminsAgentsUseCase.execute(params);
  }

  async listAgents(params: {
    search?: string;
    page?: number;
    limit?: number;
    sort?: string;
    sortField?: string;
    filters?: string;
    filtration?: string | boolean;
    pagination?: string | boolean;
    status?: string;
  }): Promise<{ data: User[]; total: number; page: number; limit: number }> {
    return this.listAgentsUseCase.execute(params);
  }

  async exportAdminsExcel(query: any): Promise<Buffer> {
    const result = await this.findAdminUsers({ ...query, pagination: 'false' });
    const rows = Array.isArray(result) ? result : result.data ?? [];
    return usersToExcel(rows, 'Administradores');
  }

  async exportAgentsExcel(query: any): Promise<Buffer> {
    const result = await this.listAgents({ ...query, pagination: 'false' });
    return usersToExcel(result.data ?? [], 'Agentes');
  }

  async exportCommunityExcel(query: any): Promise<Buffer> {
    const result = await this.gridCommunityUsers({ ...query, pagination: 'false' });
    return usersToExcel(result.data ?? [], 'Comunidad');
  }


  async updateUserAvatar(id: string, file: Express.Multer.File): Promise<User> {
    return this.updateUserAvatarUseCase.execute(id, file);
  }

  async createCommunityUser(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  ): Promise<User> {
    return this.createCommunityUserUseCase.execute(firstName, lastName, email, password);
  }

  async verifyUserEmail(token: string): Promise<User> {
    return this.verifyUserEmailUseCase.execute(token);
  }

  async resendVerificationEmail(email: string): Promise<{ token: string; expiresAt: Date; user: User }> {
    return this.resendVerificationEmailUseCase.execute(email);
  }

  async gridCommunityUsers(query: any) {
    return this.gridCommunityUsersUseCase.execute(query);
  }

  async getUserFavoriteProperties(userId: string): Promise<Property[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user || !user.favoriteProperties || user.favoriteProperties.length === 0) {
      return [];
    }

    const propertyIds = user.favoriteProperties.map(fav => fav.propertyId);

    const properties = await this.propertyRepository
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.propertyType', 'pt')
      .leftJoinAndSelect('property.multimedia', 'multimedia')
      .where('property.id IN (:...propertyIds)', { propertyIds })
      .andWhere('property.deletedAt IS NULL')
      .getMany();

    for (const property of properties) {
      if (property.mainImageUrl) {
        property.mainImageUrl = this.normalizeUrl(property.mainImageUrl);
      } else {
        const img = property.multimedia?.find(m => m.type === 'PROPERTY_IMG' || m.format === 'IMG');
        if (img) {
          property.mainImageUrl = this.normalizeUrl(img.url);
        }
      }
    }

    return properties;
  }

  private normalizeUrl(url?: string): string | undefined {
    if (!url) return url;

    const publicBaseUrl = (
      this.configService.get<string>('BACKEND_PUBLIC_URL') ||
      process.env.BACKEND_PUBLIC_URL ||
      ''
    ).replace(/\/$/, '');

    let res = url;

    if (!url.includes('/properties/img/') && !url.includes('/properties/video/')) {
      if (url.includes('/public/properties/')) {
        res = url.replace('/public/properties/', '/public/properties/img/');
      }
    }

    if (res.startsWith('/') && publicBaseUrl) {
      return `${publicBaseUrl}${res}`;
    }

    return res;
  }
}

async function usersToExcel(rows: any[], sheetName: string): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);
  sheet.columns = [
    { key: 'email', header: 'Email', width: 28 },
    { key: 'name', header: 'Nombre', width: 24 },
    { key: 'username', header: 'Usuario', width: 18 },
    { key: 'role', header: 'Rol', width: 14 },
    { key: 'status', header: 'Estado', width: 14 },
    { key: 'createdAt', header: 'Fecha creación', width: 22 },
  ];
  for (const row of rows) {
    const first = row.personalInfo?.firstName || row.firstName || '';
    const last = row.personalInfo?.lastName || row.lastName || '';
    sheet.addRow({
      email: row.email ?? '',
      name: `${first} ${last}`.trim(),
      username: row.username ?? '',
      role: row.role ?? '',
      status: row.status ?? '',
      createdAt: row.createdAt ?? '',
    });
  }
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
