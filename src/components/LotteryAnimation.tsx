import { useEffect, useState, useRef } from 'react';
import { Button } from "./ui/button";
import { Play, Square } from "lucide-react";
import type { Participant } from '../types';

interface LotteryAnimationProps {
  participants: Participant[];
  totalParticipants: number;
  isSpinning: boolean;
  winnersCount: number;
  onStart: () => void;
  onStop: (lastFrameParticipants: Participant[]) => void;
}

export const LotteryAnimation = ({
  participants,
  totalParticipants,
  isSpinning,
  winnersCount,
  onStart,
  onStop,
}: LotteryAnimationProps) => {
  const [displayNames, setDisplayNames] = useState<string[]>([]);
  const timeoutRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const lastFrameRef = useRef<Participant[]>([]);
  const frameCountRef = useRef(0);
  const FRAMES_BEFORE_STOP = 60;
  const INITIAL_SPEED = 50;
  const MAX_SPEED = 300;

  // Clean up animation frames and timeouts
  const cleanupAnimation = () => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  useEffect(() => {
    if (isSpinning && participants.length > 0) {
      frameCountRef.current = 0;
      const updateDisplay = () => {
        frameCountRef.current++;
        
        // Calculate frame delay with easing
        const progress = Math.max(0, Math.min(1, (frameCountRef.current - FRAMES_BEFORE_STOP/2) / (FRAMES_BEFORE_STOP/2)));
        const frameDelay = frameCountRef.current > FRAMES_BEFORE_STOP/2 
          ? INITIAL_SPEED + (MAX_SPEED - INITIAL_SPEED) * Math.pow(progress, 2)
          : INITIAL_SPEED;

        const newRoll = Array(winnersCount).fill(null).map(() => {
          const randomIndex = Math.floor(Math.random() * participants.length);
          return participants[randomIndex];
        });
        setDisplayNames(newRoll.map(p => p.name));
        lastFrameRef.current = newRoll;

        // Schedule next frame
        timeoutRef.current = window.setTimeout(() => {
          frameRef.current = requestAnimationFrame(updateDisplay);
        }, frameDelay);
      };

      // Start the animation
      frameRef.current = requestAnimationFrame(updateDisplay);
    } else {
      cleanupAnimation();
      if (!isSpinning && lastFrameRef.current.length > 0) {
        onStop(lastFrameRef.current);
      }
    }

    return cleanupAnimation;
  }, [isSpinning, participants, winnersCount, onStop]);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-full max-w-4xl mx-auto h-80 bg-gradient-to-b from-red-600 to-red-800 rounded-lg shadow-xl overflow-hidden border-4 border-yellow-500">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIiBmaWxsPSIjZmZkNzAwIiBmaWxsLW9wYWNpdHk9IjAuMiIvPjwvc3ZnPg==')] opacity-20" />
        {/* Decorative corners */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-yellow-300 rounded-tl-lg" />
          <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-yellow-300 rounded-tr-lg" />
          <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-yellow-300 rounded-bl-lg" />
          <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-yellow-300 rounded-br-lg" />
        </div>
        {/* Slots grid */}
        <div className={`absolute inset-0 grid gap-6 p-8 ${
          winnersCount === 1 ? 'grid-cols-1 max-w-md mx-auto' :
          winnersCount === 3 ? 'grid-cols-3' :
          'grid-cols-2'
        }`}>
          {displayNames.map((name, index) => (
            <div
              key={index}
              className="relative flex items-center justify-center bg-black/30 rounded-xl backdrop-blur-sm p-6 border border-yellow-500/30"
            >
              <div className={`text-3xl font-bold text-yellow-300 drop-shadow-lg transition-all duration-300
                ${isSpinning ? 'animate-bounce' : 'scale-110 animate-pulse'}`}>
                {name}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-xl pointer-events-none" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          size="lg"
          onClick={onStart}
          disabled={isSpinning || totalParticipants === 0}
          className="bg-red-600 hover:bg-red-700"
        >
          <Play className="mr-2 h-4 w-4" />
          开始
        </Button>
        <Button
          size="lg"
          onClick={() => {
            cleanupAnimation();
            if (lastFrameRef.current.length > 0) {
              onStop(lastFrameRef.current);
            }
          }}
          disabled={!isSpinning}
          variant="outline"
          className="border-red-600 text-red-600 hover:bg-red-50"
        >
          <Square className="mr-2 h-4 w-4" />
          停止
        </Button>
      </div>
    </div>
  );
};
