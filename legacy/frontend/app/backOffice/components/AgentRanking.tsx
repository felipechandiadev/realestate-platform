'use client'

import React from 'react'
import Card from '@/shared/components/ui/Card/Card'

interface AgentData {
  name: string
  performance: number
  rank: number
}

interface AgentRankingProps {
  data: AgentData[]
}

export default function AgentRanking({ data }: AgentRankingProps) {
  // Color coding for ranks
  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-100'
      case 2:
        return 'bg-gray-100'
      case 3:
        return 'bg-orange-100'
      default:
        return 'bg-blue-50'
    }
  }

  const getRankMedalColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'text-yellow-600'
      case 2:
        return 'text-gray-400'
      case 3:
        return 'text-orange-600'
      default:
        return 'text-blue-400'
    }
  }

  const getMedalSymbol = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇'
      case 2:
        return '🥈'
      case 3:
        return '🥉'
      default:
        return '⭐'
    }
  }

  return (
    <Card className="bg-white border border-gray-200 rounded-lg p-6 h-full">
      <h2 className="text-lg font-bold text-gray-900 mb-6">Ranking de Agentes</h2>

      <div className="space-y-4">
        {data.map((agent, index) => (
          <div
            key={index}
            className={`rounded-lg p-4 transition-all ${getRankColor(agent.rank)}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className={`text-2xl ${getRankMedalColor(agent.rank)}`}>
                  {getMedalSymbol(agent.rank)}
                </span>
                <div>
                  <p className="font-semibold text-gray-900">{agent.name}</p>
                  <p className="text-xs text-gray-500">#{agent.rank}</p>
                </div>
              </div>
              <span className="text-sm font-bold text-gray-900">{agent.performance}%</span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  agent.rank === 1
                    ? 'bg-yellow-500'
                    : agent.rank === 2
                      ? 'bg-gray-400'
                      : agent.rank === 3
                        ? 'bg-orange-500'
                        : 'bg-blue-500'
                }`}
                style={{ width: `${agent.performance}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
