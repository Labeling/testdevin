import { useState, useRef } from 'react'
import { Gift, Trophy, Users } from 'lucide-react'
import './matrix.css'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Employee {
  entryDate: string;
  id: string;
  name: string;
}

interface Prize {
  name: string;
  count: number;
  winners: Employee[];
}

function App() {
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentWinner, setCurrentWinner] = useState<Employee | null>(null)
  const [participants, setParticipants] = useState<Employee[]>([])
  const [rotationSpeed, setRotationSpeed] = useState(1)
  const [wheelRotation, setWheelRotation] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [prizeList, setPrizeList] = useState<Prize[]>([
    { name: '一等奖', count: 1, winners: [] },
    { name: '二等奖', count: 1, winners: [] },
    { name: '三等奖', count: 1, winners: [] },
    { name: '四等奖', count: 1, winners: [] },
    { name: '五等奖', count: 1, winners: [] },
  ])
  
  const [winnersPerDraw, setWinnersPerDraw] = useState<number>(1)
  const winnerCountOptions = [1, 2, 3, 4]
  const [selectedPrize, setSelectedPrize] = useState(0)
  const [lastRoundDrawCount, setLastRoundDrawCount] = useState(0)

  const startDraw = () => {
    if (participants.length === 0) return
    setIsDrawing(true)
    const drawInterval = setInterval(() => {
      setWheelRotation(prev => {
        const newRotation = prev + rotationSpeed * 5
        const index = Math.floor((newRotation / 360) * participants.length) % participants.length
        setCurrentWinner(participants[index])
        return newRotation
      })
    }, 16)
    intervalRef.current = drawInterval
  }

  const isEligibleForPrize = (employee: Employee, prizeIndex: number) => {
    if (prizeIndex > 2) return true; // 四等奖和五等奖没有年限限制
    
    const hireDate = new Date(employee.entryDate);
    const today = new Date();
    const yearsOfService = today.getFullYear() - hireDate.getFullYear() -
      (today.getMonth() < hireDate.getMonth() || 
      (today.getMonth() === hireDate.getMonth() && today.getDate() < hireDate.getDate()) ? 1 : 0);
    
    return yearsOfService >= 2;
  }

  const stopDraw = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsDrawing(false)

    // Select multiple winners based on winnersPerDraw
    const winners: Employee[] = []
    const eligibleParticipants = participants.filter(p => isEligibleForPrize(p, selectedPrize))
    
    if (eligibleParticipants.length === 0) {
      alert('没有符合条件的员工可以参与本轮抽奖！\n注意：一等奖到三等奖要求入职满2年。')
      return;
    }
    
    const remainingParticipants = [...eligibleParticipants]
    
    for (let i = 0; i < winnersPerDraw && remainingParticipants.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * remainingParticipants.length)
      winners.push(remainingParticipants[randomIndex])
      remainingParticipants.splice(randomIndex, 1)
    }

    const updatedPrizeList = [...prizeList]
    updatedPrizeList[selectedPrize].winners.push(...winners)
    setPrizeList(updatedPrizeList)
    setParticipants(participants.filter(p => !winners.includes(p)))
    setLastRoundDrawCount(winners.length)
    
    // Set the current winner to the first selected winner
    if (winners.length > 0) {
      setCurrentWinner(winners[0])
    }
    
    // Add a final spin before resetting
    const finalRotation = Math.ceil(wheelRotation / 360) * 360
    setWheelRotation(finalRotation)
    setTimeout(() => setWheelRotation(0), 1000)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.name.endsWith('.tsv')) {
      alert('请上传TSV格式的文件！')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.trim().split('\n')
      const newParticipants: Employee[] = []
      let hasError = false
      
      for (const line of lines) {
        const [entryDate, id, name] = line.trim().split('\t')
        if (!entryDate || !id || !name) {
          alert('TSV格式错误！每行必须包含：入职时间、员工号、姓名')
          hasError = true
          break
        }
        // Validate date format (YYYY-MM-DD)
        if (!/^\d{4}-\d{2}-\d{2}$/.test(entryDate)) {
          alert(`入职时间格式错误！必须为 YYYY-MM-DD 格式，例如：2022-01-01`)
          hasError = true
          break
        }
        // Validate employee ID format
        if (!/^[A-Za-z0-9]+$/.test(id)) {
          alert(`员工号格式错误！只能包含字母和数字：${id}`)
          hasError = true
          break
        }
        if (participants.some(p => p.id === id)) {
          alert(`员工号 ${id} 已存在！`)
          continue
        }
        // Validate name is not empty and reasonable length
        if (name.length < 2 || name.length > 20) {
          alert(`姓名长度必须在2-20个字符之间：${name}`)
          hasError = true
          break
        }
        newParticipants.push({ entryDate, id, name })
      }
      
      if (!hasError && newParticipants.length > 0) {
        setParticipants([...participants, ...newParticipants])
        alert(`成功导入 ${newParticipants.length} 名员工信息！`)
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-800 to-yellow-700 p-8 matrix-bg circuit-pattern">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card className="bg-black/80 backdrop-blur tech-glow border border-yellow-500/30">
          <CardHeader>
            <CardTitle className="text-center text-3xl font-bold flex items-center justify-center gap-2">
              <Trophy className="text-yellow-500" size={32} />
              <span className="bg-gradient-to-r from-yellow-400 to-red-500 text-transparent bg-clip-text">年会抽奖系统</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2 text-yellow-400">
                  <Users size={24} className="text-yellow-500" />
                  参与人员管理
                </h2>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept=".tsv"
                      onChange={handleFileUpload}
                      ref={fileInputRef}
                      className="bg-black/50 border-yellow-500/30 text-yellow-400 file:bg-red-600 file:text-white file:border-0 file:rounded-md file:px-4 file:py-2 file:mr-4 file:hover:bg-red-700 cursor-pointer"
                    />
                  </div>
                  <p className="text-yellow-400/70 text-sm">
                    上传TSV文件格式要求：每行包含 入职时间、员工号、姓名，用制表符分隔
                  </p>
                </div>
                <div className="p-4 bg-black/50 rounded-lg border border-yellow-500/30 tech-glow">
                  <p className="text-yellow-400">当前参与人数: {participants.length}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2 text-yellow-400">
                  <Gift size={24} className="text-yellow-500" />
                  奖项设置
                </h2>
                <div className="space-y-2">
                  {prizeList.map((prize, index) => (
                    <Button
                      key={index}
                      variant={selectedPrize === index ? "default" : "outline"}
                      className={`w-full justify-between transition-all duration-300 border-yellow-500/30 ${
                        selectedPrize === index ? 'scale-105 tech-glow bg-gradient-to-r from-red-600 to-yellow-600 text-white' : 'text-yellow-400 hover:text-yellow-300'
                      }`}
                      onClick={() => setSelectedPrize(index)}
                    >
                      <span>{prize.name}</span>
                      <span>{prize.winners.length}/{prize.count}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <div className="mb-4">
                {isDrawing && (
                  <div className="relative w-96 h-96 mx-auto mb-8">
                    <div 
                      className="absolute inset-0 rounded-full border-8 border-yellow-500/30 bg-gradient-to-br from-black/80 to-black/50 tech-glow"
                      style={{ transform: `rotate(${wheelRotation}deg)`, transition: 'transform 0.016s linear' }}
                    >
                      {participants.slice(0, 10).map((name, index) => (
                        <div
                          key={index}
                          className="absolute left-1/2 text-yellow-400 whitespace-nowrap"
                          style={{
                            top: '50%',
                            transform: `rotate(${(360 / 10) * index}deg) translate(-50%, -180px)`,
                            transformOrigin: '50% 180px'
                          }}
                        >
                          {name.name}
                        </div>
                      ))}
                    </div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-[16px] border-t-red-600"></div>
                  </div>
                )}
                <div className="space-y-4 mb-4">
                  <div>
                    <label className="block text-yellow-400 mb-2">转盘速度</label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={rotationSpeed}
                      onChange={(e) => setRotationSpeed(Number(e.target.value))}
                      className="w-full"
                      disabled={isDrawing}
                    />
                  </div>
                  <div>
                    <label className="block text-yellow-400 mb-2">本轮抽取人数</label>
                    <div className="flex justify-center gap-2">
                      {winnerCountOptions.map((count) => (
                        <Button
                          key={count}
                          variant={winnersPerDraw === count ? "default" : "outline"}
                          className={`${
                            winnersPerDraw === count
                              ? 'bg-red-600 hover:bg-red-700 text-white'
                              : 'text-yellow-400 hover:text-yellow-300 border-yellow-500/30'
                          }`}
                          onClick={() => setWinnersPerDraw(count)}
                          disabled={isDrawing}
                        >
                          {count}人
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-2 text-yellow-400">
                  {currentWinner ? (
                    isDrawing ? (
                      currentWinner.name
                    ) : (
                      <div>
                        <div className="text-2xl">{currentWinner.name}</div>
                        <div className="text-base font-normal mt-2 space-y-1">
                          <p>员工号: {currentWinner.id}</p>
                          <p>入职时间: {currentWinner.entryDate}</p>
                        </div>
                      </div>
                    )
                  ) : (
                    "准备开始"
                  )}
                </h3>
                {isDrawing && (
                  <p className="text-yellow-400/80">
                    {prizeList[selectedPrize].name} - 剩余名额: {
                      prizeList[selectedPrize].count - prizeList[selectedPrize].winners.length
                    }
                  </p>
                )}
                {!isDrawing && lastRoundDrawCount > 0 && (
                  <p className="text-yellow-400/80 mt-2">本轮共抽取 {lastRoundDrawCount} 人</p>
                )}
              </div>
              <Button
                size="lg"
                className="bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-700 hover:to-yellow-700 tech-glow"
                disabled={participants.length === 0}
                onClick={() => {
                  if (!isDrawing) {
                    startDraw()
                  } else {
                    stopDraw()
                  }
                }}
              >
                {isDrawing ? "停止抽奖" : "开始抽奖"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/80 backdrop-blur tech-glow border border-yellow-500/30">
          <CardHeader>
            <CardTitle className="text-yellow-400">中奖名单</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {prizeList.map((prize, index) => (
                <div key={index} className="p-4 bg-black/50 rounded-lg border border-yellow-500/30 tech-glow">
                  <h3 className="font-semibold mb-2 text-yellow-400">{prize.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    {prize.winners.map((winner) => (
                      <span 
                        key={winner.id} 
                        className="px-3 py-1 bg-black/50 text-yellow-300 rounded-full border border-yellow-500/30 tech-glow winner-circuit"
                        title={`入职时间: ${winner.entryDate} | 员工号: ${winner.id}`}
                      >
                        {winner.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default App
