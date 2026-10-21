/* eslint-disable prettier/prettier, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as ExcelJS from 'exceljs';
import { Repository } from 'typeorm';
import { Property } from '../../../property/domain/property.entity';
import { ContractOrmEntity } from '../../../contracts/infrastructure/persistence/contract.orm-entity';
import { GetAllAgentsPerformanceUseCase } from './get-all-agents-performance.usecase';
import type { ReportsQueryDto } from '../../dto/reports-query.dto';

export type AdminReportId = 'agents' | 'properties' | 'contracts' | 'geographic';

type ReportColumn = { key: string; label: string; align?: 'left' | 'right' };
export type AdminReportResult = {
  reportId: AdminReportId;
  title: string;
  generatedAt: string;
  params: ReportsQueryDto;
  summary: Record<string, number>;
  columns: ReportColumn[];
  rows: Record<string, string | number>[];
  series: Array<{ label: string; points: Array<{ label: string; value: number }> }>;
};

const REPORT_TITLES: Record<AdminReportId, string> = {
  agents: 'Desempeño de agentes',
  properties: 'Propiedades registradas',
  contracts: 'Resumen de contratos',
  geographic: 'Desempeño geográfico',
};

function operationLabel(value: string): string {
  if (value === 'SALE' || value === 'COMPRAVENTA') return 'Compraventa';
  if (value === 'RENT' || value === 'ARRIENDO') return 'Arriendo';
  return value;
}

function statusLabel(value: string): string {
  const labels: Record<string, string> = {
    REQUEST: 'Solicitud', PRE_APPROVED: 'Preaprobada', PUBLISHED: 'Publicada',
    INACTIVE: 'Inactiva', SOLD: 'Vendida', RENTED: 'Arrendada',
    IN_PROCESS: 'En proceso', CLOSED: 'Cerrado', FAILED: 'Fallido',
  };
  return labels[value] ?? value;
}

@Injectable()
export class GetAdminReportUseCase {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    @InjectRepository(ContractOrmEntity)
    private readonly contractRepository: Repository<ContractOrmEntity>,
    private readonly getAllAgentsPerformance: GetAllAgentsPerformanceUseCase,
  ) {}

  async execute(reportId: string, query: ReportsQueryDto = {}): Promise<AdminReportResult> {
    const id = reportId as AdminReportId;
    if (!Object.hasOwn(REPORT_TITLES, id)) {
      throw new BadRequestException('Tipo de reporte no válido.');
    }
    this.validateDates(query);

    const data = id === 'agents'
      ? await this.agents(query)
      : id === 'properties'
        ? await this.properties(query)
        : id === 'contracts'
          ? await this.contracts(query)
          : await this.geographic(query);

    return {
      reportId: id,
      title: REPORT_TITLES[id],
      generatedAt: new Date().toISOString(),
      params: query,
      ...data,
    };
  }

  async exportExcel(result: AdminReportResult): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(result.title.slice(0, 31));
    sheet.addRow([result.title]);
    sheet.addRow([`Generado: ${result.generatedAt}`]);
    sheet.addRow([`Período: ${result.params.startDate ?? 'Todo'} — ${result.params.endDate ?? 'Todo'}`]);
    sheet.addRow([]);
    sheet.addRow(['Indicador', 'Valor']);
    Object.entries(result.summary).forEach(([label, value]) => sheet.addRow([label, value]));
    sheet.addRow([]);
    sheet.addRow(result.columns.map((column) => column.label));
    result.rows.forEach((item) => sheet.addRow(result.columns.map((column) => item[column.key] ?? '')));
    sheet.columns = result.columns.map((column) => ({ key: column.key, width: Math.max(16, column.label.length + 3) }));
    sheet.getRow(5).font = { bold: true };
    sheet.getRow(7 + Object.keys(result.summary).length).font = { bold: true };
    sheet.eachRow((row) => row.eachCell((cell) => {
      cell.border = { bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } } };
    }));
    return Buffer.from(await workbook.xlsx.writeBuffer());
  }

  private validateDates(query: ReportsQueryDto): void {
    if (Boolean(query.startDate) !== Boolean(query.endDate)) {
      throw new BadRequestException('Debes indicar ambas fechas del período.');
    }
    if (query.startDate && query.endDate && query.startDate > query.endDate) {
      throw new BadRequestException('La fecha inicial no puede ser posterior a la fecha final.');
    }
  }

  private async agents(query: ReportsQueryDto) {
    const performances = await this.getAllAgentsPerformance.execute({
      ...(query.startDate && query.endDate
        ? { startDate: new Date(`${query.startDate}T00:00:00.000Z`), endDate: new Date(`${query.endDate}T23:59:59.999Z`) }
        : {}),
      operationType: query.operationType,
      limit: 100,
    } as any);
    const rows = performances.map((agent) => ({
      agent: agent.agentName,
      assigned: Number(agent.metrics.assignedProperties || 0),
      closed: Number(agent.metrics.closedContracts || 0),
      conversion: Number(agent.metrics.conversionRate || 0),
      avgClosureDays: Number(agent.metrics.avgClosureDays || 0),
    }));
    return {
      summary: {
        agents: rows.length,
        assignedProperties: rows.reduce((sum, row) => sum + row.assigned, 0),
        closedContracts: rows.reduce((sum, row) => sum + row.closed, 0),
      },
      columns: [
        { key: 'agent', label: 'Agente' },
        { key: 'assigned', label: 'Propiedades asignadas', align: 'right' as const },
        { key: 'closed', label: 'Contratos cerrados', align: 'right' as const },
        { key: 'conversion', label: 'Conversión %', align: 'right' as const },
        { key: 'avgClosureDays', label: 'Días promedio', align: 'right' as const },
      ],
      rows,
      series: [{ label: 'Contratos cerrados por agente', points: rows.map((row) => ({ label: row.agent, value: row.closed })) }],
    };
  }

  private async properties(query: ReportsQueryDto) {
    const qb = this.propertyRepository.createQueryBuilder('property')
      .leftJoin('property.propertyType', 'propertyType')
      .select('property.status', 'status')
      .addSelect('property.operationType', 'operation')
      .addSelect('property.currencyPrice', 'currency')
      .addSelect("COALESCE(propertyType.name, 'Sin tipo')", 'type')
      .addSelect('COUNT(property.id)', 'count')
      .where('property.deletedAt IS NULL')
      .groupBy('property.status, property.operationType, property.currencyPrice, propertyType.name')
      .orderBy('property.operationType', 'ASC')
      .addOrderBy('property.status', 'ASC');
    if (query.startDate && query.endDate) {
      qb.andWhere('property.createdAt >= :startDate AND property.createdAt < DATE_ADD(:endDate, INTERVAL 1 DAY)', {
        startDate: query.startDate,
        endDate: query.endDate,
      });
    }
    if (query.operationType) qb.andWhere('property.operationType = :operationType', { operationType: query.operationType });
    const rows = (await qb.getRawMany()).map((row) => ({
      status: statusLabel(row.status),
      operation: operationLabel(row.operation),
      currency: row.currency,
      type: row.type,
      count: Number(row.count || 0),
    }));
    const count = rows.reduce((sum, row) => sum + row.count, 0);
    return {
      summary: { properties: count, groups: rows.length },
      columns: [
        { key: 'operation', label: 'Operación' }, { key: 'status', label: 'Estado' },
        { key: 'type', label: 'Tipo' }, { key: 'currency', label: 'Moneda' },
        { key: 'count', label: 'Propiedades', align: 'right' as const },
      ],
      rows,
      series: [{ label: 'Propiedades por estado', points: rows.map((row) => ({ label: `${row.operation} · ${row.status}`, value: row.count })) }],
    };
  }

  private async contracts(query: ReportsQueryDto) {
    const qb = this.contractRepository.createQueryBuilder('contract')
      .select('contract.operation', 'operation')
      .addSelect('contract.status', 'status')
      .addSelect('contract.currency', 'currency')
      .addSelect('COUNT(contract.id)', 'count')
      .addSelect('SUM(contract.amount)', 'amount')
      .where('contract.deletedAt IS NULL');
    if (query.startDate && query.endDate) {
      qb.andWhere('contract.createdAt >= :startDate AND contract.createdAt < DATE_ADD(:endDate, INTERVAL 1 DAY)', {
        startDate: query.startDate, endDate: query.endDate,
      });
    }
    if (query.operationType) qb.andWhere('contract.operation = :operation', { operation: query.operationType === 'SALE' ? 'COMPRAVENTA' : 'ARRIENDO' });
    const rows = (await qb.groupBy('contract.operation, contract.status, contract.currency').orderBy('contract.operation', 'ASC').getRawMany())
      .map((row) => ({ operation: operationLabel(row.operation), status: statusLabel(row.status), currency: row.currency, count: Number(row.count || 0), amount: Number(row.amount || 0) }));
    const amountByCurrency = rows.reduce((totals, row) => {
      const key = row.currency === 'UF' ? 'contractValueUF' : 'contractValueCLP';
      totals[key] = (totals[key] || 0) + row.amount;
      return totals;
    }, {} as Record<string, number>);
    return {
      summary: { contracts: rows.reduce((sum, row) => sum + row.count, 0), ...amountByCurrency },
      columns: [
        { key: 'operation', label: 'Operación' }, { key: 'status', label: 'Estado' },
        { key: 'currency', label: 'Moneda' }, { key: 'count', label: 'Contratos', align: 'right' as const }, { key: 'amount', label: 'Monto contractual', align: 'right' as const },
      ],
      rows,
      series: [{ label: 'Contratos por estado', points: rows.map((row) => ({ label: `${row.operation} · ${row.status}`, value: row.count })) }],
    };
  }

  private async geographic(query: ReportsQueryDto) {
    const qb = this.propertyRepository.createQueryBuilder('property')
      .leftJoin(ContractOrmEntity, 'contract', 'contract.propertyId = property.id AND contract.deletedAt IS NULL AND contract.status = :closed', { closed: 'CLOSED' })
      .select("COALESCE(property.state, 'Sin región')", 'region')
      .addSelect("COALESCE(property.city, 'Sin comuna')", 'commune')
      .addSelect('COUNT(DISTINCT property.id)', 'assigned')
      .addSelect('COUNT(DISTINCT contract.id)', 'closed')
      .where('property.deletedAt IS NULL');
    if (query.startDate && query.endDate) {
      qb.andWhere('property.createdAt >= :startDate AND property.createdAt < DATE_ADD(:endDate, INTERVAL 1 DAY)', {
        startDate: query.startDate,
        endDate: query.endDate,
      });
    }
    if (query.operationType) {
      qb.andWhere('property.operationType = :propertyOperation', {
        propertyOperation: query.operationType,
      });
    }
    const rawRows = await qb.groupBy('property.state, property.city').orderBy('property.state', 'ASC').addOrderBy('property.city', 'ASC').getRawMany();
    const rows = rawRows.map((row) => {
      const assigned = Number(row.assigned || 0);
      const closed = Number(row.closed || 0);
      return {
        region: row.region,
        commune: row.commune,
        assigned,
        closed,
        conversion: assigned ? Math.round((closed / assigned) * 10000) / 100 : 0,
      };
    });
    return {
      summary: { regions: new Set(rows.map((row) => row.region)).size, communes: rows.length, assignedProperties: rows.reduce((sum, row) => sum + row.assigned, 0), closedContracts: rows.reduce((sum, row) => sum + row.closed, 0) },
      columns: [
        { key: 'region', label: 'Región' }, { key: 'commune', label: 'Comuna' },
        { key: 'assigned', label: 'Propiedades', align: 'right' as const }, { key: 'closed', label: 'Cierres', align: 'right' as const },
        { key: 'conversion', label: 'Conversión %', align: 'right' as const },
      ],
      rows,
      series: [{ label: 'Contratos cerrados por comuna', points: rows.slice(0, 20).map((row) => ({ label: row.commune, value: row.closed })) }],
    };
  }
}