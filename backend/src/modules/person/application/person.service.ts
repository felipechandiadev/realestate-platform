import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Repository, IsNull } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Person } from '../domain/person.entity';
import { User } from '../../users/domain/user.entity';
import { CreatePersonDto, UpdatePersonDto } from '../dto/person.dto';
import { CreatePersonUseCase } from './use-cases/create-person.usecase';
import { FindAllPersonsUseCase } from './use-cases/find-all-persons.usecase';
import { FindPersonUseCase } from './use-cases/find-person.usecase';
import { UpdatePersonUseCase } from './use-cases/update-person.usecase';
import { RemovePersonUseCase } from './use-cases/remove-person.usecase';
import { SearchPersonsUseCase } from './use-cases/search-persons.usecase';
import { VerifyPersonUseCase } from './use-cases/verify-person.usecase';
import { UnverifyPersonUseCase } from './use-cases/unverify-person.usecase';
import { RequestVerificationUseCase } from './use-cases/request-verification.usecase';
import { LinkUserUseCase } from './use-cases/link-user.usecase';
import { UnlinkUserUseCase } from './use-cases/unlink-user.usecase';

@Injectable()
export class PersonService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly createPersonUseCase: CreatePersonUseCase,
    private readonly findAllPersonsUseCase: FindAllPersonsUseCase,
    private readonly findPersonUseCase: FindPersonUseCase,
    private readonly updatePersonUseCase: UpdatePersonUseCase,
    private readonly removePersonUseCase: RemovePersonUseCase,
    private readonly searchPersonsUseCase: SearchPersonsUseCase,
    private readonly verifyPersonUseCase: VerifyPersonUseCase,
    private readonly unverifyPersonUseCase: UnverifyPersonUseCase,
    private readonly requestVerificationUseCase: RequestVerificationUseCase,
    private readonly linkUserUseCase: LinkUserUseCase,
    private readonly unlinkUserUseCase: UnlinkUserUseCase,
  ) {}

  async create(createPersonDto: CreatePersonDto): Promise<Person> {
    const p: Person = {
      id: undefined as any,
      name: createPersonDto.name || '',
      dni: createPersonDto.dni,
      userId: createPersonDto.userId,
      address: createPersonDto.address,
      city: createPersonDto.city,
      state: createPersonDto.state,
      phone: createPersonDto.phone,
      email: createPersonDto.email,
      verified: createPersonDto.verified || false,
      verificationRequest: createPersonDto.verificationRequest as any,
      dniCardFrontId: createPersonDto.dniCardFrontId,
      dniCardRearId: createPersonDto.dniCardRearId,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
    try {
      return await this.createPersonUseCase.execute(p);
    } catch (err) {
      throw new ConflictException(err.message);
    }
  }

  async findAll(): Promise<Person[]> {
    return await this.findAllPersonsUseCase.execute();
  }

  async findAllIncludingUsers(): Promise<any[]> {
    // use use-case to get persons
    const persons = await this.findAllPersonsUseCase.execute();

    const usersWithoutPerson = await this.userRepository.find({
      where: { personId: IsNull() },
      relations: ['person'],
    });

    const usersAsPersons = usersWithoutPerson.map(user => ({
      id: user.id,
      name: user.personalInfo?.firstName && user.personalInfo?.lastName
        ? `${user.personalInfo.firstName} ${user.personalInfo.lastName}`
        : user.username,
      email: user.email,
      phone: user.personalInfo?.phone,
      address: user.personalInfo?.address,
      city: user.personalInfo?.city,
      state: user.personalInfo?.state,
      verified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt,
      user: user,
      userRole: user.role,
      userStatus: user.status,
      isFromUser: true,
    }));

    return [...persons, ...usersAsPersons];
  }

  async findOne(id: string): Promise<Person> {
    const person = await this.findPersonUseCase.execute(id);
    if (!person) {
      throw new NotFoundException('Persona no encontrada');
    }
    return person;
  }

  async update(id: string, updatePersonDto: UpdatePersonDto): Promise<Person> {
    const patch = { ...updatePersonDto } as Partial<Person>;
    try {
      return await this.updatePersonUseCase.execute(id, patch);
    } catch (err) {
      if (err.message.includes('no encontrada')) {
        throw new NotFoundException(err.message);
      }
      throw new ConflictException(err.message);
    }
  }

  async remove(id: string): Promise<void> {
    await this.removePersonUseCase.execute(id);
  }

  async getPersonsForSearch(): Promise<Array<{ id: string; name: string; dni: string }>> {
    return await this.searchPersonsUseCase.execute();
  }

  async verify(id: string): Promise<void> {
    await this.verifyPersonUseCase.execute(id);
  }

  async unverify(id: string): Promise<void> {
    await this.unverifyPersonUseCase.execute(id);
  }

  async requestVerification(id: string): Promise<void> {
    await this.requestVerificationUseCase.execute(id);
  }

  async linkUser(id: string, userId: string): Promise<void> {
    await this.linkUserUseCase.execute(id, userId);
  }

  async unlinkUser(id: string): Promise<void> {
    await this.unlinkUserUseCase.execute(id);
  }}
