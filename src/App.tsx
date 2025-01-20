import { useState, useCallback } from 'react'
import { FileUpload } from './components/FileUpload'
import { PrizeTierSelector } from './components/PrizeTierSelector'
import { WinnerDisplay } from './components/WinnerDisplay'
import { Participant, PrizeTier, WinnerCount, Winner } from './types'
import { Button } from './components/ui/button'
import { Card, CardContent } from './components/ui/card'
import { DrawingAnimation } from './components/DrawingAnimation'

function App() {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [selectedTier, setSelectedTier] = useState<PrizeTier>('5')
  const [winnerCount, setWinnerCount] = useState<WinnerCount>('1')
  const [winners, setWinners] = useState<Winner[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawingParticipants, setDrawingParticipants] = useState<Participant[]>([])

  const handleParticipantUpload = useCallback((
    newParticipants: Participant[], 
    onError: (errors: string[]) => void
  ) => {
    // Validate and deduplicate participants
    const seen = new Set<string>();
    const uniqueParticipants: Participant[] = [];
    const errors: string[] = [];

    newParticipants.forEach(participant => {
      const key = `${participant.employeeId}-${participant.name}`;
      if (seen.has(key)) {
        errors.push(`重复数据: ${participant.name} (${participant.employeeId})`);
        return;
      }

      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(participant.entryDate) || isNaN(Date.parse(participant.entryDate))) {
        errors.push(`入职时间格式错误: ${participant.name} (${participant.employeeId})`);
        return;
      }

      seen.add(key);
      uniqueParticipants.push(participant);
    });

    if (errors.length > 0) {
      onError(errors);
      return;
    }

    // Remove any participants that have already won
    const winnerIds = new Set(winners.map(w => w.employeeId));
    const filteredParticipants = uniqueParticipants.filter(p => !winnerIds.has(p.employeeId));
    
    // Silently enforce tenure restrictions for top prizes
    const now = new Date();
    const twoYearsAgo = new Date(now.setFullYear(now.getFullYear() - 2));
    
    const eligibleParticipants = filteredParticipants.map(participant => ({
      ...participant,
      // Add internal flag for eligibility without exposing it in the UI
      _ineligibleForTopPrizes: new Date(participant.entryDate) > twoYearsAgo
    }));
    
    setParticipants(eligibleParticipants);
  }, [winners]);
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-800 to-red-950 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center text-yellow-500 mb-12">
          苏州博彦科技年会抽奖
        </h1>
        
        <FileUpload 
          onFileUpload={handleParticipantUpload}
        />
        <PrizeTierSelector 
          onPrizeTierChange={setSelectedTier}
          onWinnerCountChange={setWinnerCount}
        />
        
        <Card className="bg-white/10 backdrop-blur">
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-4">
              <DrawingAnimation 
                isDrawing={isDrawing}
                participants={drawingParticipants}
                winnerCount={parseInt(winnerCount)}
              />
              <div className="flex gap-4">
                <Button 
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => {
                    // Filter eligible participants based on tenure for top prizes
                    // Remove this unused code block as we now handle eligibility during drawing

                    // Filter eligible participants based on prize tier
                    let drawingPool = [...participants];
                    if (['1', '2', '3'].includes(selectedTier)) {
                      drawingPool = drawingPool.filter(p => !p._ineligibleForTopPrizes);
                    }
                    
                    if (drawingPool.length === 0) {
                      // No eligible participants for this prize tier
                      // Use a generic message without revealing the eligibility rule
                      alert('当前无可参与抽奖的人员');
                      return;
                    }
                    
                    setIsDrawing(true);
                    setDrawingParticipants(drawingPool);
                  }}
                  disabled={isDrawing || participants.length === 0}
                >
                  开始抽奖
                </Button>
                <Button 
                  className="bg-yellow-600 hover:bg-yellow-700"
                  onClick={() => {
                    const count = parseInt(winnerCount);
                    const newWinners: Winner[] = [];
                    const currentPool = [...drawingParticipants];
                    
                    // Double-check eligibility during winner selection
                    const eligiblePool = ['1', '2', '3'].includes(selectedTier)
                      ? currentPool.filter(p => !p._ineligibleForTopPrizes)
                      : currentPool;
                    
                    for (let i = 0; i < count && eligiblePool.length > 0; i++) {
                      const randomIndex = Math.floor(Math.random() * eligiblePool.length);
                      const winner = eligiblePool[randomIndex];
                      newWinners.push({
                        ...winner,
                        prizeTier: selectedTier,
                        drawTime: new Date().toISOString(),
                      });
                      eligiblePool.splice(randomIndex, 1);
                    }

                    // Update winners and participants
                    setWinners(prev => [...prev, ...newWinners]);
                    setParticipants(prev => 
                      prev.filter(p => !newWinners.some(w => w.employeeId === p.employeeId))
                    );
                    setIsDrawing(false);
                    setDrawingParticipants([]);
                  }}
                  disabled={!isDrawing}
                >
                  停止
                </Button>
              </div>
              <p className="text-white/80">
                当前奖项: {selectedTier === '1' ? '一' : selectedTier === '2' ? '二' : selectedTier === '3' ? '三' : selectedTier === '4' ? '四' : '五'}等奖
              </p>
              <p className="text-white/80">
                抽取人数: {winnerCount}名
              </p>
            </div>
          </CardContent>
        </Card>
        
        <WinnerDisplay winners={winners} />
      </div>
    </div>
  )
}

export default App
