import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, animate } from 'framer-motion';
import { useWindowSize } from '@/hooks/useWindowSize';
import { calculateCardLayout } from '@/utils/layoutCalculator';
import { AdvancedParticleBurst } from './AdvancedParticleBurst';
import { ParticipantCard } from './ParticipantCard';
import { OwnerAnnouncement } from './OwnerAnnouncement';
import { SoundEffects } from './SoundEffects';

interface Participant {
  id: number;
  name: string;
}

interface OwnerSelectionDialogProps {
  participants: Participant[];
  onClose: () => void;
}

export const OwnerSelectionDialog = ({ participants, onClose }: OwnerSelectionDialogProps) => {
  const [selectedOwner, setSelectedOwner] = useState<Participant | null>(null);
  const [status, setStatus] = useState('Initializing Selection...');
  const [showOwnerAnnouncement, setShowOwnerAnnouncement] = useState(false);
  const [eliminatedCards, setEliminatedCards] = useState(new Set<number>());
  const [ownerRevealed, setOwnerRevealed] = useState(false);
  const [particleOrigin, setParticleOrigin] = useState<{ x: number; y: number } | null>(null);
  const [playWinSound, setPlayWinSound] = useState(false);
  const [playSelectionSound, setPlaySelectionSound] = useState(false);
  const [playEliminationSound, setPlayEliminationSound] = useState(false);
  
  const { width, height } = useWindowSize();
  const spotlightRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const cardPositions = useMemo(() => 
    calculateCardLayout(participants.length, width, height), 
    [participants.length, width, height]
  );

  useEffect(() => {
    if (participants.length === 0 || cardPositions.length === 0) {
      setStatus("Not enough participants to start.");
      const timeout = setTimeout(onClose, 2000);
      return () => clearTimeout(timeout);
    }

    const timeouts: NodeJS.Timeout[] = [];

    const runSelectionSequence = async () => {
      setStatus("Selecting the owner...");
      await new Promise(resolve => {
        timeouts.push(setTimeout(resolve, 2000));
      });
      
      const selectedOwnerParticipant = participants[Math.floor(Math.random() * participants.length)];
      const ownerIndex = participants.findIndex(p => p.id === selectedOwnerParticipant.id);

      const numSpins = 3;
      const totalSteps = (numSpins * participants.length) + ownerIndex;
      const xPath: number[] = [];
      const yPath: number[] = [];
      const pathTimes: number[] = [];
      const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

      for (let i = 0; i <= totalSteps; i++) {
        const cardIndex = i % participants.length;
        const cardPos = cardPositions[cardIndex];
        if (cardPos) {
          xPath.push(cardPos.x);
          yPath.push(cardPos.y);
          pathTimes.push(easeOutQuart(i / totalSteps));
        }
      }

      const animationDuration = 10000;
      const nonOwners = participants.filter(p => p.id !== selectedOwnerParticipant.id);
      const eliminationDuration = animationDuration * 0.8;
      
      // Start selection sound
      setPlaySelectionSound(true);
      timeouts.push(setTimeout(() => setPlaySelectionSound(false), 1000));
      
      nonOwners.forEach((loser, i) => {
        const delay = (i / nonOwners.length) * eliminationDuration;
        timeouts.push(setTimeout(() => {
          setEliminatedCards(prev => new Set(prev).add(loser.id));
          // Play elimination sound for each eliminated participant
          if (i === 0) {
            setPlayEliminationSound(true);
            setTimeout(() => setPlayEliminationSound(false), 500);
          }
        }, delay));
      });

      if (spotlightRef.current) {
        await animate(spotlightRef.current, 
          { x: xPath, y: yPath }, 
          {
            duration: animationDuration / 1000,
            ease: 'linear',
            times: pathTimes
          }
        );
      }
      
      await new Promise(resolve => {
        timeouts.push(setTimeout(resolve, 300));
      });
      
      setSelectedOwner(selectedOwnerParticipant);
      setOwnerRevealed(true);
      
      const ownerRef = cardRefs.current[selectedOwnerParticipant.id];
      if (ownerRef) {
        const rect = ownerRef.getBoundingClientRect();
        setParticleOrigin({ 
          x: rect.left + rect.width / 2, 
          y: rect.top + rect.height / 2 
        });
      }

      setStatus(`🎉 The new owner is ${selectedOwnerParticipant.name}! 🎉`);
      
      // Play epic win sound
      setPlayWinSound(true);
      
      await new Promise(resolve => {
        timeouts.push(setTimeout(resolve, 2000));
      });
      
      setShowOwnerAnnouncement(true);
    };

    runSelectionSequence();

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [participants, cardPositions, onClose]);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-40 font-sans overflow-hidden">
      <AnimatePresence>
        {selectedOwner && (
          <AdvancedParticleBurst 
            width={width} 
            height={height} 
            origin={particleOrigin} 
            intensity="epic"
          />
        )}
      </AnimatePresence>
      
      {/* Sound Effects */}
      <SoundEffects
        playWinSound={playWinSound}
        playSelectionSound={playSelectionSound}
        playEliminationSound={playEliminationSound}
        onSoundComplete={() => {
          setPlayWinSound(false);
          setPlaySelectionSound(false);
          setPlayEliminationSound(false);
        }}
      />

      {/* Enhanced spotlight with multiple layers */}
      <motion.div 
        ref={spotlightRef} 
        className="absolute w-60 h-60 rounded-full opacity-40 blur-3xl"
        style={{ 
          x: -200, 
          y: -200,
          background: 'radial-gradient(circle, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.3) 50%, transparent 100%)'
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.4, 0.7, 0.4]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut' as const
        }}
      />
      
      {/* Secondary spotlight ring */}
      <motion.div 
        ref={spotlightRef} 
        className="absolute w-80 h-80 rounded-full opacity-20 blur-2xl"
        style={{ 
          x: -200, 
          y: -200,
          background: 'radial-gradient(circle, transparent 40%, hsl(var(--primary) / 0.2) 50%, transparent 80%)'
        }}
        animate={{
          scale: [1.2, 1, 1.2],
          rotate: [0, 360]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear' as const
        }}
      />

      <div className="w-full h-full relative">
        <AnimatePresence>
          {cardPositions.length > 0 && participants.map((participant, index) => (
            <motion.div
              key={participant.id}
              ref={el => cardRefs.current[participant.id] = el}
              className="absolute"
              initial={{ 
                x: width / 2 - 50, 
                y: height / 2 - 50, 
                opacity: 0 
              }}
              animate={{ 
                x: cardPositions[index]?.x, 
                y: cardPositions[index]?.y, 
                opacity: 1 
              }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: 1, 
                ease: [0.16, 1, 0.3, 1], 
                delay: 0.5 + index * 0.03 
              }}
            >
              <ParticipantCard
                participant={participant}
                isOwner={selectedOwner?.id === participant.id}
                isEliminated={eliminatedCards.has(participant.id)}
                ownerRevealed={ownerRevealed}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center">
        <motion.div
          className="relative"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut' as const
          }}
        >
          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="text-xl text-foreground tracking-wider font-semibold relative z-10"
            style={{
              textShadow: '0 0 20px hsl(var(--primary) / 0.5)'
            }}
          >
            {status}
          </motion.p>
          
          {/* Background glow effect */}
          <motion.div
            className="absolute inset-0 rounded-lg bg-primary/10 blur-xl"
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [0.8, 1.2, 0.8]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut' as const
            }}
          />
        </motion.div>
      </div>
    
      <AnimatePresence>
        {showOwnerAnnouncement && (
          <OwnerAnnouncement 
            selectedOwner={selectedOwner} 
            onClose={onClose} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};