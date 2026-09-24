import { Injectable, ConflictException } from '@nestjs/common';
import { UserRepository } from '../../domain/user.repository';
import { CreateUserDto } from '../../dto/user.dto';
import { User, UserStatus, UserRole } from '../../domain/user.entity';
import { Person } from '../../../person/domain/person.entity';
import { PersonOrmEntity } from '../../../person/infrastructure/persistence/person.orm-entity';

@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly userRepo: UserRepository,
  ) {}

  async execute(dto: CreateUserDto): Promise<User> {
    // uniqueness check
    const existing = await this.userRepo.find({
      where: [
        { username: dto.username },
        { email: dto.email },
      ],
    });
    if (existing && existing.length) {
      throw new ConflictException('El nombre de usuario o correo ya está registrado.');
    }

    // transaction-like behavior using manager
    const manager = this.userRepo.manager;
    const queryRunner = manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const personalInfo = dto.personalInfo
        ? {
            firstName: dto.personalInfo.firstName,
            lastName: dto.personalInfo.lastName,
            phone: dto.personalInfo.phone,
            avatarUrl: dto.personalInfo.avatarUrl === undefined ? null : dto.personalInfo.avatarUrl,
          }
        : {};

      const user = this.userRepo.create({
        ...dto,
        status: UserStatus.ACTIVE,
        role: dto.role || UserRole.COMMUNITY,
        permissions: dto.permissions || [],
        personalInfo: personalInfo as any,
      } as any);

      await user.setPassword(dto.password);

      const savedUser = await queryRunner.manager.save(User, user as any);

      const personOrm = new PersonOrmEntity();
      personOrm.verified = false;
      personOrm.user = savedUser as any;
      await queryRunner.manager.save(PersonOrmEntity, personOrm as any);

      await queryRunner.commitTransaction();
      return savedUser;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
