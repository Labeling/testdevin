import React from 'react'
import { Card, CardContent } from "./ui/card"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { Label } from "./ui/label"
import { PrizeTier, WinnerCount } from '../types'

interface PrizeTierSelectorProps {
  onPrizeTierChange?: (tier: PrizeTier) => void;
  onWinnerCountChange?: (count: WinnerCount) => void;
}

const PRIZE_TIERS = [
  { value: "1", label: "一等奖" },
  { value: "2", label: "二等奖" },
  { value: "3", label: "三等奖" },
  { value: "4", label: "四等奖" },
  { value: "5", label: "五等奖" },
]

const WINNER_COUNTS = [
  { value: "1", label: "1名" },
  { value: "2", label: "2名" },
  { value: "3", label: "3名" },
  { value: "4", label: "4名" },
]

export const PrizeTierSelector: React.FC<PrizeTierSelectorProps> = ({ 
  onPrizeTierChange,
  onWinnerCountChange 
}) => {
  return (
    <Card className="w-full bg-white/10 backdrop-blur">
      <CardContent className="p-6">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-bold text-white mb-4">奖项设置</h3>
            <RadioGroup 
              defaultValue="5" 
              className="flex flex-col gap-3"
              onValueChange={(value) => onPrizeTierChange?.(value as PrizeTier)}
            >
              {PRIZE_TIERS.map((tier) => (
                <div key={tier.value} className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value={tier.value} 
                    id={`tier-${tier.value}`}
                    className="data-[state=checked]:bg-yellow-400/20 data-[state=checked]:ring-2 data-[state=checked]:ring-yellow-400 data-[state=checked]:ring-offset-2 transition-all duration-200"
                  />
                  <Label 
                    htmlFor={`tier-${tier.value}`} 
                    className="text-white data-[state=checked]:text-yellow-400 data-[state=checked]:font-bold transition-all duration-200 hover:text-yellow-300"
                  >
                    {tier.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-4">抽取人数</h3>
            <RadioGroup 
              defaultValue="1" 
              className="flex flex-col gap-3"
              onValueChange={(value) => onWinnerCountChange?.(value as WinnerCount)}
            >
              {WINNER_COUNTS.map((count) => (
                <div key={count.value} className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value={count.value} 
                    id={`count-${count.value}`}
                    className="data-[state=checked]:bg-yellow-400/20 data-[state=checked]:ring-2 data-[state=checked]:ring-yellow-400 data-[state=checked]:ring-offset-2 transition-all duration-200"
                  />
                  <Label 
                    htmlFor={`count-${count.value}`} 
                    className="text-white data-[state=checked]:text-yellow-400 data-[state=checked]:font-bold transition-all duration-200 hover:text-yellow-300"
                  >
                    {count.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
