import React from 'react'
import { Card, CardContent } from "./ui/card"
import { Winner, PrizeTier } from '../types'

interface WinnerDisplayProps {
  winners: Winner[];
}

const PRIZE_LABELS: Record<PrizeTier, string> = {
  '1': '一等奖',
  '2': '二等奖',
  '3': '三等奖',
  '4': '四等奖',
  '5': '五等奖',
}

export const WinnerDisplay: React.FC<WinnerDisplayProps> = ({ winners }) => {
  const groupedWinners = winners.reduce((acc, winner) => {
    if (!acc[winner.prizeTier]) {
      acc[winner.prizeTier] = [];
    }
    acc[winner.prizeTier].push(winner);
    return acc;
  }, {} as Record<PrizeTier, Winner[]>);

  return (
    <div className="space-y-4">
      {Object.entries(groupedWinners).map(([tier, tierWinners]) => (
        <Card key={tier} className="bg-white/10 backdrop-blur">
          <CardContent className="p-4">
            <h3 className="text-lg font-bold text-yellow-500 mb-2">
              {PRIZE_LABELS[tier as PrizeTier]} ({tierWinners.length}人)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {tierWinners.map((winner) => (
                <div
                  key={winner.employeeId}
                  className="bg-white/5 rounded p-2 text-sm text-white"
                >
                  <div className="font-medium">{winner.name}</div>
                  <div className="text-white/60 text-xs">{winner.employeeId}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
