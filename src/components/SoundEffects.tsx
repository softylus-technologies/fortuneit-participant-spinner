import { useEffect, useCallback } from 'react';

interface SoundEffectsProps {
  playWinSound?: boolean;
  playSelectionSound?: boolean;
  playEliminationSound?: boolean;
  playProgressSound?: boolean;
  onSoundComplete?: () => void;
}

// Web Audio API sound generator
const createAudioContext = () => {
  if (typeof window === 'undefined') return null;
  try {
    return new (window.AudioContext || (window as any).webkitAudioContext)();
  } catch {
    return null;
  }
};

const playTone = (audioContext: AudioContext, frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.1) => {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  oscillator.type = type;
  
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
};

const playChord = (audioContext: AudioContext, frequencies: number[], duration: number, type: OscillatorType = 'sine', volume: number = 0.05) => {
  frequencies.forEach(freq => playTone(audioContext, freq, duration, type, volume));
};

export const SoundEffects = ({ 
  playWinSound, 
  playSelectionSound, 
  playEliminationSound, 
  playProgressSound,
  onSoundComplete 
}: SoundEffectsProps) => {
  
  const playWinSequence = useCallback(() => {
    const audioContext = createAudioContext();
    if (!audioContext) return;
    
    // Epic win fanfare
    const notes = [
      { freq: [523.25, 659.25, 783.99], duration: 0.4 }, // C major chord
      { freq: [587.33, 739.99, 880.00], duration: 0.4 }, // D major chord
      { freq: [659.25, 830.61, 987.77], duration: 0.6 }, // E major chord
      { freq: [523.25, 659.25, 783.99, 1046.5], duration: 1.0 }, // C major chord with octave
    ];
    
    notes.forEach((note, index) => {
      setTimeout(() => {
        playChord(audioContext, note.freq, note.duration, 'triangle', 0.08);
        if (index === notes.length - 1) {
          // Add sparkle effect
          setTimeout(() => {
            for (let i = 0; i < 8; i++) {
              setTimeout(() => {
                playTone(audioContext, 1046.5 + Math.random() * 500, 0.2, 'sine', 0.03);
              }, i * 50);
            }
            onSoundComplete?.();
          }, note.duration * 1000);
        }
      }, index * 300);
    });
  }, [onSoundComplete]);

  const playSelectionSequence = useCallback(() => {
    const audioContext = createAudioContext();
    if (!audioContext) return;
    
    // Ascending selection sound
    const frequencies = [220, 277, 330, 392, 440, 523];
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        playTone(audioContext, freq, 0.15, 'triangle', 0.04);
        if (index === frequencies.length - 1) onSoundComplete?.();
      }, index * 80);
    });
  }, [onSoundComplete]);

  const playEliminationSequence = useCallback(() => {
    const audioContext = createAudioContext();
    if (!audioContext) return;
    
    // Descending elimination sound
    const frequencies = [440, 392, 330, 277, 220];
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        playTone(audioContext, freq, 0.1, 'sawtooth', 0.02);
        if (index === frequencies.length - 1) onSoundComplete?.();
      }, index * 60);
    });
  }, [onSoundComplete]);

  const playProgressSequence = useCallback(() => {
    const audioContext = createAudioContext();
    if (!audioContext) return;
    
    // Subtle progress tick
    playTone(audioContext, 800, 0.05, 'square', 0.015);
    onSoundComplete?.();
  }, [onSoundComplete]);

  useEffect(() => {
    if (playWinSound) playWinSequence();
  }, [playWinSound, playWinSequence]);

  useEffect(() => {
    if (playSelectionSound) playSelectionSequence();
  }, [playSelectionSound, playSelectionSequence]);

  useEffect(() => {
    if (playEliminationSound) playEliminationSequence();
  }, [playEliminationSound, playEliminationSequence]);

  useEffect(() => {
    if (playProgressSound) playProgressSequence();
  }, [playProgressSound, playProgressSequence]);

  return null;
};