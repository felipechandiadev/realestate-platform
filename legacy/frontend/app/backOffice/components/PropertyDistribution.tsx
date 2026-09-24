'use client'

import React from 'react'
import Card from '@/shared/components/ui/Card/Card'

interface PropertyTypeData {
  type: string
  count: number
  percentage: number
}

interface PropertyDistributionProps {
  data: PropertyTypeData[]
}

export default function PropertyDistribution({ data }: PropertyDistributionProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0)

  return (
    <Card className="bg-white border border-gray-200 rounded-lg p-6 h-full">
      <h2 className="text-lg font-bold text-gray-900 mb-6">Distribución por Tipo de Propiedad</h2>

      <div className="space-y-6">
        {data.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">{item.type}</span>
              <div className="flex gap-3">
                <span className="text-sm font-semibold text-gray-900">{item.count}</span>
                <span className="text-sm font-semibold text-gray-500">{item.percentage}%</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Total de propiedades: <span className="font-bold text-gray-900">{total}</span>
        </p>
      </div>
    </Card>
  )
}
