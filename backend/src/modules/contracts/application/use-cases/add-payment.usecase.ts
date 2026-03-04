import { Injectable } from '@nestjs/common';
import { ContractRepository } from '../../domain/contract.repository';
import { AddPaymentDto } from '../../dto/contract.dto';
import { Payment } from '../../domain/payment.entity';

@Injectable()
export class AddPaymentUseCase {
  constructor(private readonly contractRepository: ContractRepository) {}

  async execute(contractId: string, dto: AddPaymentDto): Promise<Payment> {
    const paymentRepo = this.contractRepository.manager.getRepository(Payment);
    const newPayment = paymentRepo.create({
      ...dto,
      date: new Date(dto.date),
      contractId,
    });
    return paymentRepo.save(newPayment);
  }
}
