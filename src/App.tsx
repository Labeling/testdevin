import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Trophy, Gift } from "lucide-react"
import { SlotReel } from "@/components/SlotReel"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Participant {
  hireDate: string;
  employeeId: string;
  name: string;
}

interface Winner {
  participant: Participant;
  prizeLevel: number;
}

function App() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [drawInProgress, setDrawInProgress] = useState(false);
  const [prizeLevel, setPrizeLevel] = useState<number>(5);
  const [winnersCount, setWinnersCount] = useState<number>(1);
  const [error, setError] = useState<string>("");
  const [remainingCount, setRemainingCount] = useState<number>(0);
  const [eligibleParticipants, setEligibleParticipants] = useState<Participant[]>([]);

  const validateParticipant = (participant: Participant): boolean => {
    // Validate hire date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(participant.hireDate)) {
      setError("入职日期格式错误，请使用YYYY-MM-DD格式");
      return false;
    }

    // Check for duplicate employee IDs
    const isDuplicate = participants.some(p => p.employeeId === participant.employeeId);
    if (isDuplicate) {
      setError("发现重复的员工号");
      return false;
    }

    return true;
  };

  const checkTenureEligibility = (participant: Participant, prizeLevel: number): boolean => {
    if (prizeLevel <= 3) {
      const hireDate = new Date(participant.hireDate);
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
      return hireDate <= twoYearsAgo;
    }
    return true;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("File upload triggered");
    const file = event.target.files?.[0];
    if (file) {
      console.log("File selected:", file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log("File read complete");
        const text = e.target?.result as string;
        console.log("File content:", text);
        const lines = text.trim().split('\n');
        const newParticipants: Participant[] = [];
        setError("");
        
        try {
          for (const line of lines) {
            const [hireDate, employeeId, name] = line.split('\t');
            if (!hireDate || !employeeId || !name) {
              console.error("Invalid line format:", line);
              setError("文件格式错误：每行必须包含入职时间、员工号和姓名，以制表符分隔");
              return;
            }
            
            const participant = { hireDate, employeeId, name };
            console.log("Processing participant:", participant);
            
            if (validateParticipant(participant)) {
              newParticipants.push(participant);
              console.log("Participant added:", participant);
            }
          }
          
          if (newParticipants.length > 0) {
            setParticipants(prev => {
              const updated = [...prev, ...newParticipants];
              setRemainingCount(updated.length);
              return updated;
            });
          } else {
            setError("没有有效的参与者数据");
          }
        } catch (error) {
          console.error("Error processing file:", error);
          setError("处理文件时出错，请检查文件格式");
        }
      };
      reader.readAsText(file);
    }
  };

  const startDrawing = () => {
    setDrawInProgress(true);
    
    // Filter eligible participants
    const eligible = participants.filter(p => 
      !winners.some(w => w.participant.employeeId === p.employeeId) &&
      checkTenureEligibility(p, prizeLevel)
    );

    if (eligible.length === 0) {
      setError("没有符合条件的参与者");
      setDrawInProgress(false);
      return;
    }

    setEligibleParticipants(eligible);

    // Start animation
    return null;
  };

  const stopDrawing = () => {
    try {
      const actualWinnersCount = Math.min(winnersCount, eligibleParticipants.length);
      
      // Select winners
      const newWinners: Winner[] = [];
      const shuffled = [...eligibleParticipants].sort(() => Math.random() - 0.5);
      
      for (let i = 0; i < actualWinnersCount; i++) {
        newWinners.push({
          participant: shuffled[i],
          prizeLevel
        });
      }

      // Update state
      setWinners(prev => [...prev, ...newWinners]);
      // Animation will stop automatically when drawInProgress becomes false
      setDrawInProgress(false);
      setRemainingCount(prev => prev - newWinners.length);
      setEligibleParticipants([]);
    } catch (error) {
      console.error('Error during winner selection:', error);
      setError('抽奖过程出现错误，请重试');
      setDrawInProgress(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-red-100">
      <div className="container mx-auto py-8">
        <h1 className="text-4xl font-bold text-center text-red-800 mb-8">
          苏州博彦年会抽奖系统
        </h1>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="p-6 mb-8 bg-white/90 shadow-lg">
          <div className="space-y-6">
            <div>
              <Label className="text-lg font-semibold">上传参与者名单 (TSV格式)</Label>
              <Input 
                type="file" 
                accept=".tsv"
                onChange={handleFileUpload}
                className="mt-2"
              />
              <p className="text-sm text-gray-500 mt-1">
                剩余参与人数: {remainingCount}
              </p>
            </div>

            <div>
              <Label className="text-lg font-semibold">选择奖项</Label>
              <RadioGroup
                defaultValue="5"
                className="grid grid-cols-5 gap-4 mt-2"
                onValueChange={(value) => setPrizeLevel(Number(value))}
              >
                {[1, 2, 3, 4, 5].map((level) => (
                  <div key={level} className="flex items-center space-x-2">
                    <RadioGroupItem value={level.toString()} id={`prize-${level}`} />
                    <Label htmlFor={`prize-${level}`}>{level}等奖</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div>
              <Label className="text-lg font-semibold">每轮获奖人数</Label>
              <RadioGroup
                defaultValue="1"
                className="grid grid-cols-4 gap-4 mt-2"
                onValueChange={(value) => setWinnersCount(Number(value))}
              >
                {[1, 2, 3, 4].map((count) => (
                  <div key={count} className="flex items-center space-x-2">
                    <RadioGroupItem value={count.toString()} id={`count-${count}`} />
                    <Label htmlFor={`count-${count}`}>{count}人</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="flex justify-center space-x-4">
              <Button 
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white px-8"
                disabled={participants.length === 0 || drawInProgress}
                onClick={startDrawing}
              >
                <Trophy className="mr-2" />
                开始抽奖
              </Button>
              <Button 
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white px-8"
                disabled={!drawInProgress}
                onClick={stopDrawing}
              >
                停止抽奖
              </Button>
            </div>
          </div>
        </Card>

        {/* Slot machine animation */}
        {drawInProgress && (
          <Card className="p-8 mb-8 bg-white/90 shadow-lg">
            <div className="flex justify-center items-center">
              <SlotReel 
                names={eligibleParticipants.map(p => p.name)} 
                speed={80} 
                isSpinning={drawInProgress} 
              />
            </div>
          </Card>
        )}
        
        {/* Winners display grouped by prize level */}
        <div className="space-y-8">
          {[1, 2, 3, 4, 5].reverse().map((level) => {
            const levelWinners = winners.filter(w => w.prizeLevel === level);
            if (levelWinners.length === 0) return null;
            
            return (
              <div key={level} className="bg-white/90 rounded-lg p-6 shadow-lg">
                <h3 className="text-2xl font-bold text-red-800 flex items-center mb-4">
                  <Trophy className="mr-2 h-6 w-6" />
                  {level}等奖 (共 {levelWinners.length} 人)
                </h3>
                <div className="flex flex-wrap gap-4">
                  {levelWinners.map((winner, index) => (
                    <Card key={index} className="p-3 bg-red-50/50 border border-red-100 flex-grow-0">
                      <div className="flex items-center whitespace-nowrap">
                        <Gift className="text-red-600 mr-2 h-5 w-5" />
                        <span className="text-red-800 text-lg">
                          {winner.participant.name} ({winner.participant.employeeId})
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default App
