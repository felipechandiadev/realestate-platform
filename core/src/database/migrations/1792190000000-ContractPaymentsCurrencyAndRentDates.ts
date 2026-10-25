import { MigrationInterface, QueryRunner } from 'typeorm';
import { randomUUID } from 'crypto';

/**
 * Contratos:
 * - `payments.currency`: moneda de cada pago (antes se mezclaban UF y CLP sin distinguir).
 * - `contracts.startDate` / `contracts.durationMonths`: vigencia del arriendo como datos
 *   (antes solo quedaban escritos en la descripción).
 * - Copia a la tabla `payments` los pagos que los contratos creados desde el backoffice
 *   dejaron solo en la columna JSON `contracts.payments` (sin id no se podían marcar
 *   como pagados ni recibir comprobantes). Comisiones en CLP; el resto en la moneda del contrato.
 *
 * Idempotente: revisa columnas existentes y solo copia contratos sin filas en `payments`.
 */
type JsonPayment = {
  amount?: number | string;
  date?: string;
  description?: string;
  type?: string;
  status?: string;
  paidAt?: string | null;
  isAgencyRevenue?: boolean;
  currency?: string;
};

const PAYMENT_TYPES = new Set([
  'COMMISSION_INCOME',
  'RENT_PAYMENT',
  'SALE_DOWN_PAYMENT',
  'SALE_INSTALLMENT',
  'SALE_FINAL_PAYMENT',
  'DEPOSIT',
  'MAINTENANCE_FEE',
  'UTILITIES',
  'OTHER',
]);
const PAYMENT_STATUSES = new Set([
  'PENDING',
  'PAID',
  'CANCELLED',
  'PENDING_VERIFICATION',
]);

export class ContractPaymentsCurrencyAndRentDates1792190000000 implements MigrationInterface {
  name = 'ContractPaymentsCurrencyAndRentDates1792190000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('payments')) {
      if (!(await queryRunner.hasColumn('payments', 'currency'))) {
        await queryRunner.query(
          "ALTER TABLE `payments` ADD `currency` varchar(8) NOT NULL DEFAULT 'CLP'",
        );
        // Pagos existentes: comisiones en CLP; el resto en la moneda del contrato.
        await queryRunner.query(
          `UPDATE payments p JOIN contracts c ON c.id = p.contractId
           SET p.currency = CASE WHEN p.type = 'COMMISSION_INCOME' THEN 'CLP' ELSE COALESCE(c.currency, 'CLP') END`,
        );
      }
    }

    if (await queryRunner.hasTable('contracts')) {
      if (!(await queryRunner.hasColumn('contracts', 'startDate'))) {
        await queryRunner.query(
          'ALTER TABLE `contracts` ADD `startDate` date NULL',
        );
      }
      if (!(await queryRunner.hasColumn('contracts', 'durationMonths'))) {
        await queryRunner.query(
          'ALTER TABLE `contracts` ADD `durationMonths` int NULL',
        );
      }
    }

    if (
      !(await queryRunner.hasTable('payments')) ||
      !(await queryRunner.hasTable('contracts'))
    )
      return;

    const contracts: Array<{
      id: string;
      currency: string | null;
      payments: unknown;
    }> = await queryRunner.query(
      `SELECT c.id, c.currency, c.payments FROM contracts c
         WHERE c.payments IS NOT NULL
           AND NOT EXISTS (SELECT 1 FROM payments p WHERE p.contractId = c.id)`,
    );

    for (const contract of contracts) {
      const list = parseJsonPayments(contract.payments);
      for (const payment of list) {
        const amount = Number(payment.amount);
        if (!Number.isFinite(amount) || amount <= 0 || !payment.date) continue;
        const type = PAYMENT_TYPES.has(String(payment.type))
          ? String(payment.type)
          : 'OTHER';
        const status = PAYMENT_STATUSES.has(String(payment.status))
          ? String(payment.status)
          : 'PENDING';
        const currency =
          payment.currency === 'UF' || payment.currency === 'CLP'
            ? payment.currency
            : type === 'COMMISSION_INCOME'
              ? 'CLP'
              : contract.currency === 'UF'
                ? 'UF'
                : 'CLP';
        await queryRunner.query(
          `INSERT INTO payments (id, amount, date, description, type, status, currency, paidAt, isAgencyRevenue, contractId)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            randomUUID(),
            amount,
            String(payment.date).slice(0, 10),
            payment.description ?? null,
            type,
            status,
            currency,
            payment.paidAt ? new Date(payment.paidAt) : null,
            payment.isAgencyRevenue ? 1 : 0,
            contract.id,
          ],
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Los pagos copiados se conservan (la columna JSON sigue intacta).
    if (await queryRunner.hasColumn('contracts', 'durationMonths')) {
      await queryRunner.query(
        'ALTER TABLE `contracts` DROP COLUMN `durationMonths`',
      );
    }
    if (await queryRunner.hasColumn('contracts', 'startDate')) {
      await queryRunner.query(
        'ALTER TABLE `contracts` DROP COLUMN `startDate`',
      );
    }
    if (await queryRunner.hasColumn('payments', 'currency')) {
      await queryRunner.query('ALTER TABLE `payments` DROP COLUMN `currency`');
    }
  }
}

function parseJsonPayments(raw: unknown): JsonPayment[] {
  try {
    const value: unknown = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return Array.isArray(value) ? (value as JsonPayment[]) : [];
  } catch {
    return [];
  }
}
