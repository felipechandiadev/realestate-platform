import { User } from './user.entity';

export abstract class UserRepository {
  abstract create(data: Partial<User>): User;
  abstract save(user: User): Promise<User>;
  abstract find(options?: any): Promise<User[]>;
  abstract findOne(options?: any): Promise<User | null>;
  abstract update(id: string, patch: Partial<User>): Promise<void>;
  abstract softDelete(id: string): Promise<void>;
  abstract createQueryBuilder(alias: string): any;
  abstract get manager(): any;
}
