import { Person } from './person.entity';

export abstract class PersonRepository {
  abstract save(person: Person): Promise<Person>;
  abstract findAll(): Promise<Person[]>;
  abstract findById(id: string): Promise<Person | null>;
  abstract findByDni(dni: string): Promise<Person | null>;
  abstract softRemove(person: Person): Promise<void>;
  abstract searchMinimal(): Promise<Array<{ id: string; name: string; dni: string }>>;

  // repository-like helpers used by application logic
  abstract findOne(options: any): Promise<Person | null>;
  abstract find(options?: any): Promise<Person[]>;
  abstract createQueryBuilder(alias: string): any;
  abstract update(id: string, partial: Partial<Person>): Promise<any>;
}
