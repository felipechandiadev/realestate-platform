import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import * as bcrypt from 'bcrypt';
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
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    return this.createUserUseCase.execute(createUserDto);
  }

  async findAll(): Promise<User[]> {
    return this.findAllUsersUseCase.execute();
  }

  async findAdminUsers(filters: ListAdminUsersQueryDto): Promise<User[]> {
    return this.findAdminUsersUseCase.execute(filters);
  }

  async findOne(id: string): Promise<User> {
    return this.findUserUseCase.execute(id);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    return this.updateUserUseCase.execute(id, updateUserDto);
  }

  async softDelete(id: string): Promise<void> {
    await this.softDeleteUserUseCase.execute(id);
  }

  async login(loginDto: LoginDto): Promise<any> {
    return this.loginUserUseCase.execute(loginDto);
  }

  async assignRole(id: string, role: UserRole): Promise<any> {
    return this.assignRoleUseCase.execute(id, role);
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

  async setStatus(id: string, status: UserStatus): Promise<User> {
    return this.setStatusUseCase.execute(id, status);
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
  }): Promise<{ data: User[]; total: number; page: number; limit: number }> {
    return this.listAgentsUseCase.execute(params);
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
