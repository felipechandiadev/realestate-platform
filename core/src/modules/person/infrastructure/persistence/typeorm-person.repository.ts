import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { PersonRepository } from '../../domain/person.repository';
import { Person } from '../../domain/person.entity';
import { PersonOrmEntity } from './person.orm-entity';

@Injectable()
export class TypeormPersonRepository extends PersonRepository {
  constructor(
    @InjectRepository(PersonOrmEntity)
    private readonly repository: Repository<PersonOrmEntity>,
  ) {
    super(); // required even if base class has no custom constructor
  }

  private toDomain(entity: PersonOrmEntity): Person {
    return {
      id: entity.id,
      name: entity.name,
      dni: entity.dni,
      address: (entity as any).address,
      city: (entity as any).city,
      state: (entity as any).state,
      phone: (entity as any).phone,
      email: (entity as any).email,
      userId: entity.userId || undefined,
      dniCardFrontId: (entity as any).dniCardFrontId,
      dniCardRearId: (entity as any).dniCardRearId,
      dniCardFront: (entity as any).dniCardFront,
      dniCardRear: (entity as any).dniCardRear,
      user: entity.user ? { id: entity.user.id } : undefined,
      verified: (entity as any).verified,
      verificationRequest: (entity as any).verificationRequest,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
    };
  }

  private toOrm(domain: Person): PersonOrmEntity {
    const orm = new PersonOrmEntity();
    Object.assign(orm, domain);
    // ensure relations ids are correctly set
    if (domain.dniCardFrontId !== undefined) orm.dniCardFrontId = domain.dniCardFrontId;
    if (domain.dniCardRearId !== undefined) orm.dniCardRearId = domain.dniCardRearId;
    return orm;
  }

  async save(person: Person): Promise<Person> {
    const orm = this.toOrm(person);
    const saved = await this.repository.save(orm);
    return this.toDomain(saved);
  }

  async findAll(): Promise<Person[]> {
    const list = await this.repository.find({
      relations: ['user', 'dniCardFront', 'dniCardRear'],
    });
    return list.map(e => this.toDomain(e));
  }

  async findById(id: string): Promise<Person | null> {
    const found = await this.repository.findOne({
      where: { id },
      relations: ['user', 'dniCardFront', 'dniCardRear'],
    });
    return found ? this.toDomain(found) : null;
  }

  async findByDni(dni: string): Promise<Person | null> {
    const found = await this.repository.findOne({ where: { dni } });
    return found ? this.toDomain(found) : null;
  }

  async softRemove(person: Person): Promise<void> {
    const orm = this.toOrm(person);
    await this.repository.softRemove(orm);
  }

  async searchMinimal(): Promise<Array<{ id: string; name: string; dni: string }>> {
    const persons = await this.repository.find({
      select: ['id', 'name', 'dni'],
      where: { deletedAt: IsNull() },
    });
    return persons.map(p => ({
      id: p.id,
      name: p.name || 'Sin nombre',
      dni: p.dni || 'Sin RUT',
    }));
  }

  // support for abstract methods added to contract
  async findOne(options: any): Promise<Person | null> {
    const found = await this.repository.findOne(options);
    return found ? this.toDomain(found) : null;
  }

  async find(options?: any): Promise<Person[]> {
    const list = await this.repository.find(options);
    return list.map(e => this.toDomain(e));
  }

  createQueryBuilder(alias: string) {
    return this.repository.createQueryBuilder(alias);
  }

  async update(id: string, partial: Partial<Person>): Promise<any> {
    // cast because null values (deletedAt) aren’t accepted by deep partial type
    return this.repository.update(id, partial as any);
  }
}
