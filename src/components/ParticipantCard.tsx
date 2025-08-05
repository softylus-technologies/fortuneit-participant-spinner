import { motion } from 'framer-motion';
import { Users } from 'lucide-react';

interface Participant {
  id: number;
  name: string;
}

interface ParticipantCardProps {
  participant: Participant;
  isOwner: boolean;
  isEliminated: boolean;
  ownerRevealed: boolean;
}

export const ParticipantCard = ({ 
  participant, 
  isOwner, 
  isEliminated, 
  ownerRevealed 
}: ParticipantCardProps) => {
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.5 
    },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { 
        type: 'spring' as const, 
        stiffness: 300, 
        damping: 20 
      }
    },
    eliminated: { 
      opacity: 0.1, 
      scale: 0.8, 
      transition: { 
        duration: 0.3 
      } 
    },
    owner: { 
      scale: 1.1, 
      y: 0, 
      opacity: 1, 
      transition: { 
        type: 'spring' as const, 
        stiffness: 300, 
        damping: 15 
      } 
    },
    flyOut: { 
      opacity: 0, 
      scale: 0.5, 
      y: -100, 
      transition: { 
        duration: 0.4, 
        ease: 'easeIn' as const
      } 
    }
  };

  const getAnimationState = () => {
    if (ownerRevealed) {
      return isOwner ? 'owner' : 'flyOut';
    }
    if (isEliminated) {
      return 'eliminated';
    }
    return 'visible';
  };

  return (
    <motion.div
      layout
      variants={cardVariants}
      initial="hidden"
      animate={getAnimationState()}
      className="relative flex flex-col items-center justify-center p-2 rounded-lg text-center w-[100px] h-[100px]"
    >
      <motion.div 
        className="w-16 h-16 md:w-20 md:h-20 bg-card/20 rounded-full flex items-center justify-center border border-border/20 backdrop-blur-sm"
        animate={{ y: [0, -5, 0] }}
        transition={{ 
          duration: 3, 
          repeat: Infinity, 
          ease: 'easeInOut' as const, 
          delay: Math.random() * 2 
        }}
      >
        <Users size={32} className="text-muted-foreground" />
      </motion.div>
      <p className="mt-2 text-xs font-semibold truncate w-24 text-card-foreground">
        {participant.name}
      </p>
    </motion.div>
  );
};