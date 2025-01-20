import React, { useEffect, useState, useRef } from 'react'
import { Participant } from '../types'

// Create oscillator for slot machine sound
const createSlotSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.type = 'square';
  oscillator.frequency.value = 20;
  gainNode.gain.value = 0.1;
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  return { oscillator, gainNode, audioContext };
}

// Create win sound effect
const createWinSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.type = 'sine';
  oscillator.frequency.value = 440;
  gainNode.gain.value = 0;
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  // Create winning sound effect
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
  oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(440, audioContext.currentTime + 1);
  
  return { oscillator, gainNode, audioContext };
}

interface DrawingAnimationProps {
  isDrawing: boolean;
  participants: Participant[];
  winnerCount: number;
}

export const DrawingAnimation: React.FC<DrawingAnimationProps> = ({
  isDrawing,
  participants,
  winnerCount,
}) => {
  const [slots, setSlots] = useState<Array<Array<string>>>([]);
  const animationFrameRef = useRef<number>();
  const speedRef = useRef(1);
  const offsetsRef = useRef<number[]>([]);
  const slotSoundRef = useRef<any>(null);
  const winSoundRef = useRef<any>(null);
  const winnerSoundPlayedRef = useRef(false);

  useEffect(() => {
    if (!isDrawing || participants.length === 0) {
      setSlots([]);
      offsetsRef.current = [];
      if (slotSoundRef.current) {
        slotSoundRef.current.gainNode.gain.setValueAtTime(0, slotSoundRef.current.audioContext.currentTime);
        slotSoundRef.current.oscillator.stop();
        slotSoundRef.current = null;
      }
      return;
    }
    
    // Create and start slot machine sound
    if (!slotSoundRef.current) {
      try {
        slotSoundRef.current = createSlotSound();
        slotSoundRef.current.oscillator.start();
      } catch (error) {
        console.error('Failed to create slot sound:', error);
      }
    }

    // Initialize slots with 20 names each for smooth scrolling
    const newSlots = Array.from({ length: winnerCount }).map(() => {
      const names: string[] = [];
      for (let i = 0; i < 20; i++) {
        const randomIndex = Math.floor(Math.random() * participants.length);
        names.push(participants[randomIndex].name);
      }
      return names;
    });
    setSlots(newSlots);
    offsetsRef.current = new Array(winnerCount).fill(0);
    speedRef.current = 1;

    const animate = () => {
      offsetsRef.current = offsetsRef.current.map((offset, i) => {
        // Update offset for smooth scrolling
        const newOffset = (offset + speedRef.current) % (40 * slots[i]?.length || 1);
        return newOffset;
      });

      // Gradually slow down when stopping
      if (!isDrawing && speedRef.current > 0.1) {
        speedRef.current *= 0.92; // Slower deceleration for more drama
        
        // Play winner sound when almost stopped
        if (speedRef.current < 0.15 && !winnerSoundPlayedRef.current) {
          // Stop slot sound
          if (slotSoundRef.current) {
            slotSoundRef.current.gainNode.gain.setValueAtTime(0, slotSoundRef.current.audioContext.currentTime);
            slotSoundRef.current.oscillator.stop();
            slotSoundRef.current = null;
          }
          
          // Play win sound
          try {
            winSoundRef.current = createWinSound();
            winSoundRef.current.oscillator.start();
            winSoundRef.current.oscillator.stop(winSoundRef.current.audioContext.currentTime + 1);
          } catch (error) {
            console.error('Failed to create win sound:', error);
          }
          
          winnerSoundPlayedRef.current = true;
          
          // Add flash effect
          const slots = document.querySelectorAll('.slot-reel');
          slots.forEach(slot => {
            slot.classList.add('flash-animation');
          });
        }
      }

      // Request next frame
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isDrawing, participants, winnerCount, slots]);

  // Always render the slots container, even when not drawing
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-8">
      {(slots.length > 0 ? slots : [Array(20).fill('')]).map((slotNames, slotIndex) => (
        <div
          key={slotIndex}
          className={`slot-reel bg-gradient-to-b from-red-900/80 to-red-950/90 backdrop-blur rounded-lg p-4 overflow-hidden h-48 relative ${isDrawing ? 'spinning' : ''}`}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70 pointer-events-none" />
          <div 
            className="transition-transform duration-100"
            style={{
              transform: `translateY(-${offsetsRef.current[slotIndex]}px)`,
            }}
          >
            {slotNames.map((name, index) => (
              <div
                key={index}
                className="text-2xl font-bold text-yellow-500 py-2 whitespace-nowrap text-center"
                style={{
                  textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                }}
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
