import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { GridRentPropertiesUseCase } from './grid-rent-properties.usecase';

@Injectable()
export class ExportRentPropertiesExcelUseCase {
  constructor(private readonly gridRentPropertiesUseCase: GridRentPropertiesUseCase) {}

  async execute(query: any): Promise<Buffer> {
    const columns = [
      { key: 'id', header: 'ID' },
      { key: 'title', header: 'Título' },
      { key: 'status', header: 'Estado' },
      { key: 'isFeatured', header: 'Destacada' },
      { key: 'operationType', header: 'Operación' },
      { key: 'typeName', header: 'Tipo' },
      { key: 'assignedAgentName', header: 'Agente' },
      { key: 'city', header: 'Ciudad' },
      { key: 'state', header: 'Región' },
      { key: 'price', header: 'Precio' },
      { key: 'createdAt', header: 'Creado' },
    ];

    const fields = columns.map(c => c.key).join(',');
    const gridResult = await this.gridRentPropertiesUseCase.execute({ ...query, fields, pagination: 'false' });
    const rows = Array.isArray(gridResult) ? gridResult : gridResult.data;

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Propiedades en Arriendo');
    sheet.columns = columns.map(col => ({ key: col.key, header: col.header, width: 22 }));

    rows.forEach(row => {
      const excelRow: Record<string, any> = {};
      columns.forEach(col => {
        excelRow[col.key] = row[col.key] ?? '';
      });
      sheet.addRow(excelRow);
    });

    sheet.eachRow({ includeEmpty: true }, (row) => {
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
