import { Injectable, ConflictException } from '@nestjs/common';
import { UserRepository } from '../../domain/user.repository';
import { User, UserRole, UserStatus } from '../../domain/user.entity';
import { Person } from '../../../person/domain/person.entity';
import { PersonOrmEntity } from '../../../person/infrastructure/persistence/person.orm-entity';

@Injectable()
export class CreateCommunityUserUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(firstName: string, lastName: string, email: string, password: string): Promise<User> {
    const existing = await this.userRepo.findOne({ where: { email } });
    if (existing) {
      throw new ConflictException('Este correo electrónico ya está registrado');
    }

    const emailVerificationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const emailVerificationExpires = new Date();
    emailVerificationExpires.setHours(emailVerificationExpires.getHours() + 24);

    const manager = this.userRepo.manager;
    const queryRunner = manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const user = this.userRepo.create({
        username: email,
        email,
        role: UserRole.COMMUNITY,
        status: UserStatus.ACTIVE,
        emailVerified: false,
        emailVerificationToken,
        emailVerificationExpires,
        personalInfo: { firstName, lastName } as any,
      } as any);
      await user.setPassword(password);
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
