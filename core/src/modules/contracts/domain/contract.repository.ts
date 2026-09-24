import { Contract } from './contract.entity';

export abstract class ContractRepository {
  abstract save(contract: Contract): Promise<Contract>;
  abstract findById(id: string): Promise<Contract | null>;
  abstract findAll(options?: any): Promise<Contract[]>;
  abstract update(id: string, patch: Partial<Contract>): Promise<void>;
  abstract softDelete(id: string): Promise<void>;
  // helpers used by service layer; ideally these should be replaced
  // by proper domain methods to avoid leaking ORM internals.
  abstract createQueryBuilder(alias: string): any;
  abstract create(entity: Partial<Contract>): Contract;
  abstract findOne(options: any): Promise<Contract | null>;
  abstract get manager(): any;
}