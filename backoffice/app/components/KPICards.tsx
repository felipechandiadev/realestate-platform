'use client'

import React from 'react'
import { Card } from "@realestate/ui"

interface KPICardData {
  title: string
  value: string | number
  unit?: string
  /** % contra el mes anterior; null u omitido = sin comparación (no se muestra la línea). */
  variation?: number | null
}

interface KPICardsProps {
  data: KPICardData[]
}

export default function KPICards({ data }: KPICardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {data.map((kpi, index) => (
        <Card key={index} className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex flex-col h-full justify-between">
            {/* Title */}
            <h3 className="text-gray-600 text-sm font-medium mb-4">{kpi.title}</h3>

            {/* Main value */}
            <div className="mb-4">
              <p className="text-2xl sm:text-3xl lg:text-5xl font-bold text-gray-900 break-words">
                {kpi.value}
                {kpi.unit && <span className="text-base sm:text-xl lg:text-2xl font-normal ml-2">{kpi.unit}</span>}
              </p>
            </div>

            {/* Variation indicator (solo si hay con qué comparar) */}
            {typeof kpi.variation === 'number' ? (() => {
              const isPositive = kpi.variation >= 0
              return (
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
                  isPositive ? 'bg-green-100' : 'bg-red-100'
                }`}
              >
                <span className={`text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositive ? '↑' : '↓'}
                </span>
              </span>
              <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(kpi.variation)}% vs mes anterior
              </span>
            </div>
              )
            })() : null}
          </div>
        </Card>
      ))}
    </div>
  )
}
