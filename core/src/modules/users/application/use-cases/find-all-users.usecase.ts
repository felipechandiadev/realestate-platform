import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/user.repository';
import { IsNull } from 'typeorm';
import { User } from '../../domain/user.entity';

@Injectable()
export class FindAllUsersUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  execute(): Promise<User[]> {
    return this.userRepo.find({ where: { deletedAt: IsNull() }, order: { createdAt: 'DESC' } });
  }
}
