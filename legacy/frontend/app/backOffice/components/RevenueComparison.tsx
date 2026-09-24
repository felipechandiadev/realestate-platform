'use client'

import React from 'react'
import Card from '@/shared/components/ui/Card/Card'

interface RevenueComparisonProps {
  currentMonth: number // Current month amount
  previousYearSameMonth: number // Same month last year
  monthName?: string
}

export default function RevenueComparison({
  currentMonth = 14.2,
  previousYearSameMonth = 11.8,
  monthName = 'Junio'
}: RevenueComparisonProps) {
  const variation = ((currentMonth - previousYearSameMonth) / previousYearSameMonth) * 100
  const isPositive = variation >= 0

  return (
    <Card className="bg-white border border-gray-200 rounded-lg p-6 h-full">
      <h2 className="text-lg font-bold text-gray-900 mb-6">Comparación de Ingresos</h2>

      <div className="space-y-6">
        {/* Current month */}
        <div>
          <p className="text-sm text-gray-600 mb-2">Mes Actual ({monthName})</p>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-bold text-gray-900">${currentMonth.toFixed(1)}</p>
            <span className="text-gray-500 text-lg">M</span>
          </div>
        </div>

        {/* Previous year same month */}
        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Mismo mes año anterior</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-semibold text-gray-600">${previousYearSameMonth.toFixed(1)}</p>
            <span className="text-gray-400 text-sm">M</span>
          </div>
        </div>

        {/* Variation */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Variación anual</span>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                  isPositive ? 'bg-green-100' : 'bg-red-100'
                }`}
              >
                <span className={`text-lg font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositive ? '↑' : '↓'}
                </span>
              </span>
              <span className={`text-lg font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? '+' : ''}{variation.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Visual bar */}
          <div className="mt-4">
            <div className="flex gap-2 h-8">
              {/* Previous year bar */}
              <div className="flex-1 bg-gray-200 rounded-lg overflow-hidden">
                <div
                  className="bg-gray-400 h-full rounded-lg transition-all"
                  style={{ width: '100%' }}
                />
              </div>
              {/* Current year bar */}
              <div className="flex-1 bg-blue-200 rounded-lg overflow-hidden">
                <div
                  className={`h-full rounded-lg transition-all ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ width: `${(currentMonth / Math.max(currentMonth, previousYearSameMonth)) * 100}%` }}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-2 text-xs text-gray-500">
              <span>Año anterior</span>
              <span>Año actual</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
