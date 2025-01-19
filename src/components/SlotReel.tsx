import { useEffect, useState } from 'react';

interface SlotReelProps {
  names: string[];
  speed?: number;
  isSpinning: boolean;
}

export function SlotReel({ names, speed = 100, isSpinning }: SlotReelProps) {
  const [displayNames, setDisplayNames] = useState<string[]>([]);
  const [position, setPosition] = useState(0);

  useEffect(() => {
    if (!isSpinning) {
      const finalNames = [...names].sort(() => Math.random() - 0.5).slice(0, 5);
      setDisplayNames(finalNames);
      return;
    }

    const updateReel = () => {
      const shuffled = [...names].sort(() => Math.random() - 0.5);
      setDisplayNames(shuffled.slice(0, 5));
      setPosition(prev => (prev + 5) % 100);
    };

    updateReel();
    const interval = setInterval(updateReel, speed);

    return () => clearInterval(interval);
  }, [names, speed, isSpinning]);

  return (
    <div className="relative w-[480px] h-[480px] bg-gradient-to-b from-red-100 to-red-50 rounded-lg shadow-lg overflow-hidden border-8 border-red-800">
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div 
          className="flex flex-col items-center transition-transform duration-100"
          style={{
            transform: `translateY(${position * 4}px)`,
            willChange: 'transform'
          }}
        >
          {displayNames.map((name, index) => (
            <div
              key={`${name}-${index}`}
              className="text-6xl font-bold text-red-800 py-10 w-full text-center bg-white/95 border-y-4 border-red-300"
            >
              {name}
            </div>
          ))}
        </div>
      </div>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-x-0 top-0 h-2/5 bg-gradient-to-b from-red-800/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-red-800/60 to-transparent" />
        <div className="absolute inset-x-0 top-1/2 h-3 bg-red-800 shadow-lg transform -translate-y-1/2" />
      </div>
    </div>
  );
}
