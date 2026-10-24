'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button, Card, Select } from '@realestate/ui';
import { exportAdminReport, getAdminReport, type ReportId, type ReportQuery, type ReportResult } from '../actions/reports.action';
import {
  getReportDateRange,
  REPORT_DATE_PRESETS,
  type ReportDatePreset,
  type ReportDateRange,
} from '../lib/date-presets';
import './reports.css';

const REPORTS: Array<{ id: ReportId; label: string; description: string }> = [
  { id: 'agents', label: 'Agentes', description: 'Desempeño, cierres y conversión.' },
  { id: 'properties', label: 'Propiedades', description: 'Registros agrupados por estado, operación, tipo y moneda.' },
  { id: 'contracts', label: 'Contratos', description: 'Conteo y monto contractual por operación y estado.' },
  { id: 'geographic', label: 'Geográfico', description: 'Propiedades y cierres por región y comuna.' },
];

const KPI_LABELS: Record<string, string> = {
  agents: 'Agentes', assignedProperties: 'Propiedades asignadas', closedContracts: 'Contratos cerrados',
  contractValueCLP: 'Valor contractual (CLP)', contractValueUF: 'Valor contractual (UF)',
  properties: 'Propiedades', groups: 'Grupos',
  contracts: 'Contratos', regions: 'Regiones', communes: 'Comunas',
};

function formatValue(key: string, value: number) {
  if (/UF$/i.test(key)) return `${new Intl.NumberFormat('es-CL', { maximumFractionDigits: 2 }).format(value)} UF`;
  if (/value|price|amount/i.test(key)) return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value);
  return new Intl.NumberFormat('es-CL', { maximumFractionDigits: 2 }).format(value);
}

function formatCell(row: Record<string, string | number>, key: string) {
  const value = row[key];
  if (typeof value !== 'number') return value;
  if (key === 'amount' && row.currency === 'UF') {
    return `${new Intl.NumberFormat('es-CL', { maximumFractionDigits: 2 }).format(value)} UF`;
  }
  return formatValue(key, value);
}

export default function ReportsWorkspace() {
  const { data: session, status } = useSession();
  const [reportId, setReportId] = useState<ReportId>('agents');
  const [datePreset, setDatePreset] = useState<ReportDatePreset>('thisMonth');
  const [dateRange, setDateRange] = useState<ReportDateRange | null>(() => getReportDateRange('thisMonth'));
  const [operationType, setOperationType] = useState<'' | 'SALE' | 'RENT'>('');
  const [result, setResult] = useState<ReportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const requestIdRef = useRef(0);

  const query = useMemo<ReportQuery>(() => ({
    ...(dateRange ? { startDate: dateRange.startDate, endDate: dateRange.endDate } : {}),
    ...(operationType ? { operationType } : {}),
  }), [dateRange, operationType]);

  const loadReport = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    if (datePreset === 'custom' && (!dateRange?.startDate || !dateRange?.endDate)) {
      setError('Indica ambas fechas para el período personalizado.');
      setResult(null);
      setLoading(false);
      return;
    }
    if (dateRange && dateRange.startDate > dateRange.endDate) {
      setError('La fecha inicial no puede ser posterior a la fecha final.');
      setResult(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    const response = await getAdminReport(reportId, query);
    if (requestId !== requestIdRef.current) return;
    if (response.success) setResult(response.data);
    else { setResult(null); setError(response.error ?? 'No se pudo cargar el reporte.'); }
    setLoading(false);
  }, [datePreset, dateRange, query, reportId]);

  useEffect(() => { void loadReport(); }, [loadReport, refreshKey]);

  async function handleExport() {
    setExporting(true);
    const response = await exportAdminReport(reportId, query);
    setExporting(false);
    if (!response.success) { setError(response.error ?? 'No se pudo exportar el reporte.'); return; }
    const blob = await fetch(`data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${response.base64}`).then((res) => res.blob());
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = response.filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function handlePresetChange(id: string | number | null) {
    if (!id) return;
    const preset = String(id) as ReportDatePreset;
    setDatePreset(preset);
    setDateRange(getReportDateRange(preset));
  }

  function handleCustomDateChange(key: 'startDate' | 'endDate', value: string) {
    setDatePreset('custom');
    setDateRange((current) => ({
      startDate: key === 'startDate' ? value : current?.startDate ?? '',
      endDate: key === 'endDate' ? value : current?.endDate ?? '',
    }));
  }

  if (status === 'loading') return <div className="p-8 text-sm text-gray-500">Verificando permisos…</div>;
  if (session?.user?.role !== 'ADMIN') return <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-800">Esta sección está disponible solo para administradores.</div>;

  return (
    <section className="reports-page space-y-6" data-test-id="reports-workspace">
      <header className="reports-header flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Inteligencia de negocio</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Reportes</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">Analiza propiedades, contratos, agentes y actividad geográfica desde una sola vista.</p>
        </div>
        <div className="reports-actions flex gap-2">
          <Button variant="secondary" onClick={() => window.print()}>Imprimir / PDF</Button>
          <Button variant="primary" onClick={handleExport} disabled={!result || exporting}>{exporting ? 'Preparando…' : 'Exportar Excel'}</Button>
        </div>
      </header>

      <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
        <Card className="reports-filters h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Configurar informe</h2>
          <div className="mt-5">
            <Select
              label="Reporte"
              options={REPORTS.map((report) => ({ id: report.id, label: report.label }))}
              value={reportId}
              onChange={(id) => id && setReportId(String(id) as ReportId)}
              allowClear={false}
              data-test-id="reports-report-select"
            />
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-500">{REPORTS.find((report) => report.id === reportId)?.description}</p>
          <div className="mt-5">
            <Select
              label="Período"
              options={REPORT_DATE_PRESETS.map((preset) => ({ id: preset.id, label: preset.label }))}
              value={datePreset}
              onChange={handlePresetChange}
              allowClear={false}
              data-test-id="reports-date-preset-select"
            />
          </div>
          {datePreset === 'custom' && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="text-xs font-semibold text-slate-600">
                Desde
                <input
                  className="report-input mt-2"
                  type="date"
                  value={dateRange?.startDate ?? ''}
                  onChange={(event) => handleCustomDateChange('startDate', event.target.value)}
                />
              </label>
              <label className="text-xs font-semibold text-slate-600">
                Hasta
                <input
                  className="report-input mt-2"
                  type="date"
                  value={dateRange?.endDate ?? ''}
                  onChange={(event) => handleCustomDateChange('endDate', event.target.value)}
                />
              </label>
            </div>
          )}
          <div className="mt-4">
            <Select
              label="Operación"
              options={[
                { id: 'all', label: 'Todas' },
                { id: 'SALE', label: 'Venta' },
                { id: 'RENT', label: 'Arriendo' },
              ]}
              value={operationType || 'all'}
              onChange={(id) => setOperationType(id === 'SALE' || id === 'RENT' ? id : '')}
              allowClear={false}
              data-test-id="reports-operation-select"
            />
          </div>
          <Button variant="secondary" className="mt-5 w-full" onClick={() => setRefreshKey((key) => key + 1)}>Actualizar reporte</Button>
        </Card>

        <div className="min-w-0 space-y-4">
          {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}
          {loading && <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">Generando reporte…</div>}
          {!loading && !error && result && <>
            <div className="report-title-row flex flex-wrap items-end justify-between gap-3">
              <div><h2 className="text-xl font-bold text-slate-900">{result.title}</h2><p className="mt-1 text-xs text-slate-500">Generado {new Date(result.generatedAt).toLocaleString('es-CL')} · {query.startDate && query.endDate ? `${query.startDate} — ${query.endDate}` : 'Todo el período disponible'}</p></div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
              {Object.entries(result.summary).map(([key, value]) => <Card key={key} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-medium text-slate-500">{KPI_LABELS[key] || key}</p><p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{formatValue(key, value)}</p></Card>)}
            </div>
            {result.series.map((series) => {
              const max = Math.max(1, ...series.points.map((point) => point.value));
              return <Card key={series.label} className="report-chart rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="font-semibold text-slate-900">{series.label}</h3><div className="mt-5 space-y-3">{series.points.slice(0, 12).map((point, index) => <div key={`${point.label}-${index}`} className="grid grid-cols-[minmax(90px,160px)_1fr_60px] items-center gap-3 text-xs"><span className="truncate text-slate-600" title={point.label}>{point.label}</span><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-600" style={{ width: `${Math.max(point.value > 0 ? 2 : 0, point.value / max * 100)}%` }} /></div><span className="text-right font-semibold tabular-nums text-slate-700">{formatValue('count', point.value)}</span></div>)}</div>{series.points.length > 12 && <p className="mt-3 text-xs text-slate-400">Gráfico limitado a 12 elementos; la tabla incluye todos los resultados.</p>}</Card>;
            })}
            <Card className="report-table-card overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="min-w-full text-sm"><thead className="bg-slate-50"><tr>{result.columns.map((column) => <th key={column.key} className={`whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 ${column.align === 'right' ? 'text-right' : 'text-left'}`}>{column.label}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{result.rows.map((row, index) => <tr key={index} className="hover:bg-slate-50/70">{result.columns.map((column) => <td key={column.key} className={`whitespace-nowrap px-4 py-3 text-slate-700 ${column.align === 'right' ? 'text-right tabular-nums' : ''}`}>{formatCell(row, column.key)}</td>)}</tr>)}{result.rows.length === 0 && <tr><td colSpan={result.columns.length} className="px-4 py-12 text-center text-slate-400">No hay datos para los filtros seleccionados.</td></tr>}</tbody></table></div></Card>
          </>}
        </div>
      </div>
    </section>
  );
}