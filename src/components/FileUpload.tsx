import React from 'react'
import { Upload, X } from "lucide-react"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"
import { Participant } from '../types'

interface FileUploadProps {
  onFileUpload?: (participants: Participant[], onError: (errors: string[]) => void) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const [participantCount, setParticipantCount] = React.useState(0);
  const [errors, setErrors] = React.useState<string[]>([]);
  
  const handleError = React.useCallback((newErrors: string[]) => {
    setErrors(newErrors);
    setParticipantCount(0);
  }, []);
  return (
    <Card className="w-full bg-white/10 backdrop-blur">
      <CardContent className="p-6">
        <div className="flex flex-col items-center gap-4">
          <Upload className="w-12 h-12 text-yellow-500" />
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertTitle className="flex items-center justify-between">
                文件验证错误
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-4 w-4 p-0" 
                  onClick={() => setErrors([])}
                >
                  <X className="h-4 w-4" />
                </Button>
              </AlertTitle>
              <AlertDescription>
                <ul className="list-disc pl-4 space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          <input
            type="file"
            accept=".tsv"
            className="hidden"
            id="tsv-upload"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  const text = event.target?.result as string;
                  const lines = text.split('\n').filter(line => line.trim());
                  // Skip header line if present
                  const dataLines = lines[0].includes('入职时间') ? lines.slice(1) : lines;
                  
                  // Validate and parse participants
                  const seen = new Set<string>();
                  const participants: Participant[] = [];
                  const errors: string[] = [];

                  dataLines.forEach((line, index) => {
                    const [entryDate, employeeId, name] = line.split('\t').map(s => s.trim());
                    
                    // Validate required fields
                    if (!entryDate || !employeeId || !name) {
                      errors.push(`第 ${index + 1} 行: 缺少必填字段`);
                      return;
                    }

                    // Validate date format (YYYY-MM-DD)
                    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                    if (!dateRegex.test(entryDate) || isNaN(Date.parse(entryDate))) {
                      errors.push(`第 ${index + 1} 行: 入职时间格式错误，应为 YYYY-MM-DD`);
                      return;
                    }

                    // Check for duplicates
                    const key = `${employeeId}-${name}`;
                    if (seen.has(key)) {
                      errors.push(`第 ${index + 1} 行: 重复数据 (${name})`);
                      return;
                    }
                    seen.add(key);

                    participants.push({ entryDate, employeeId, name });
                  });

                  if (errors.length > 0) {
                    setErrors(errors);
                    return;
                  }
                  setErrors([]);

                  onFileUpload?.(participants, handleError);
                  setParticipantCount(participants.length);
                };
                reader.readAsText(file);
              }
            }}
          />
          <Button 
            className="bg-red-600 hover:bg-red-700"
            onClick={() => document.getElementById('tsv-upload')?.click()}
          >
            上传参与者名单 (TSV)
          </Button>
          <p className="text-white/80">总参与人数: {participantCount}</p>
        </div>
      </CardContent>
    </Card>
  )
}
