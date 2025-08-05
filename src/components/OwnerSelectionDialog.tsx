import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, animate } from 'framer-motion';
import { useWindowSize } from '@/hooks/useWindowSize';
import { calculateCardLayout } from '@/utils/layoutCalculator';
import { ParticleBurst } from './ParticleBurst';
import { ParticipantCard } from './ParticipantCard';
import { OwnerAnnouncement } from './OwnerAnnouncement';

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
      
      nonOwners.forEach((loser, i) => {
        const delay = (i / nonOwners.length) * eliminationDuration;
        timeouts.push(setTimeout(() => {
          setEliminatedCards(prev => new Set(prev).add(loser.id));
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
          <ParticleBurst width={width} height={height} origin={particleOrigin} />
        )}
      </AnimatePresence>

      <motion.div 
        ref={spotlightRef} 
        className="absolute w-40 h-40 rounded-full bg-primary/20 blur-3xl" 
        style={{ x: -200, y: -200 }} 
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
        <motion.p 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="text-xl text-foreground tracking-wider"
        >
          {status}
        </motion.p>
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