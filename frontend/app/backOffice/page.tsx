/**
 * BackOffice Dashboard Page (ROOT)
 * 
 * Propósito:
 * - Mostrar resumen general del negocio inmobiliario
 * - Visualizar KPIs clave (ingresos, propiedades activas, etc.)
 * - Mostrar análisis de distribución de propiedades
 * - Mostrar ranking de agentes por desempeño
 * - Mostrar comparación de ingresos y tendencias
 * 
 * Funcionalidad:
 * - Fetch de datos de analytics desde backend (/analytics/summary)
 * - Formatea datos para visualización en gráficos y cards
 * - Componentes: KPICards, PropertyDistribution, AgentRanking, RevenueChart, RevenueComparison
 * 
 * Audiencia: Administradores, Directores, Gerentes de ventas
 */

import React from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { env } from '@/lib/env'

import KPICards from './components/KPICards'
import PropertyDistribution from './components/PropertyDistribution'
import AgentRanking from './components/AgentRanking'
import RevenueChart from './components/RevenueChart'
import RevenueComparison from './components/RevenueComparison'

// Server component: consume /analytics/summary and pass real data to client components
export default async function BackOfficeDashboard() {
  // Get session to attach access token to backend requests
  const session = await getServerSession(authOptions)
  const accessToken = session?.accessToken

  try {
    const res = await fetch(`${env.backendApiUrl}/analytics/summary`, {
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : ''
      },
      cache: 'no-store'
    })

    if (!res.ok) throw new Error('No se pudo cargar el resumen de analytics')
    const summary = await res.json()

    // Build KPI cards from summary
    // Prefer raw CLP amount from backend for KPI display (falls back to millions->CLP)
    const rawRevenueCLP = Number(summary.rawTotalRevenueThisMonth ?? Math.round((Number(summary.totalRevenueThisMonth ?? 0) * 1_000_000)));
    const revenueFormatted = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(rawRevenueCLP);

    const kpiData = [
      {
        title: 'Ingresos Totales del Mes',
        // show localized CLP string (e.g. "$700.000")
        value: revenueFormatted,
        unit: '',
        variation: 0,
        isPositive: true
      },
      {
        title: 'Propiedades Activas',
        value: summary.activeProperties ?? 0,
        unit: '',
        variation: 0,
        isPositive: true
      },
      {
        title: 'Nuevos Miembros (comunidad)',
        value: summary.newMembersThisMonth ?? 0,
        unit: '',
        variation: 0,
        isPositive: true
      },
      {
        title: 'Tiempo Promedio Venta',
        value: Math.round(summary.avgClosureDays ?? 0),
        unit: 'días',
        variation: 0,
        isPositive: false
      }
    ]

    // Revenue chart (last 6 months, already in millions)
    const revenueData = (summary.revenueTrend ?? []).map((r: any) => Number(r.amount ?? 0))
    const months = (summary.revenueTrend ?? []).map((r: any) => r.month)

    // Revenue comparison: use current month and fallback previous-month if previousYearSameMonth not available
    const currentMonth = revenueData[revenueData.length - 1] ?? 0
    const previousYearSameMonth = (summary.previousYearSameMonth ?? revenueData[revenueData.length - 2] ?? 0)
    const monthName = new Date().toLocaleString('es-CL', { month: 'long' })

    // Property distribution
    const propertyDistributionData = summary.propertyDistribution ?? []

    // Agent ranking: normalize agent metrics to component shape
    const agentRankingData = (summary.agentRanking ?? [])
      .slice()
      .sort((a: any, b: any) => (b.metrics?.closedContracts || 0) - (a.metrics?.closedContracts || 0))
      .map((a: any, idx: number) => ({
        name: a.agentName,
        performance: Math.round(a.metrics?.conversionRate || 0),
        rank: idx + 1,
      }))

    return (
      <div className="min-h-screen p-4">
        <div className="max-w-7xl mx-auto">
          {/* Section 1: KPI Cards */}
          <KPICards data={kpiData} />

          {/* Diagnostic info (visible when backend returns diagnostic fields) */}
          {typeof summary.agencyPaymentsCountThisMonth !== 'undefined' && (
            <div className="mt-2 text-sm text-muted-foreground">
              <strong>Diagnóstico:</strong>
              {' '}
              {summary.agencyPaymentsCountThisMonth} pago(s) reconocidos como ingreso de la empresa este mes • monto total: {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(summary.rawTotalRevenueThisMonth ?? 0)}
            </div>
          )}

          {/* Section 2: Bottom row with charts */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <RevenueChart data={revenueData} months={months} />
            </div>

            <div className="lg:col-span-4">
              <RevenueComparison currentMonth={currentMonth} previousYearSameMonth={previousYearSameMonth} monthName={monthName} />
            </div>
          </div>

          {/* Section 3: Property distribution + Agent ranking */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <PropertyDistribution data={propertyDistributionData} />
            <AgentRanking data={agentRankingData} />
          </div>
        </div>
      </div>
    )
  } catch (error: any) {
    // Simple server-side fallback UI
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-xl font-semibold mb-2">Error cargando el dashboard</h2>
          <p className="text-sm text-muted-foreground">{error?.message ?? 'Error de conexión'}</p>
        </div>
      </div>
    )
  }
}
