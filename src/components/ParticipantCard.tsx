import { motion, useAnimation } from 'framer-motion';
import { Users, Star, Sparkles, Crown } from 'lucide-react';
import { useEffect } from 'react';

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
  const controls = useAnimation();
  
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.5,
      rotateY: -180 
    },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      rotateY: 0,
      transition: { 
        type: 'spring' as const, 
        stiffness: 300, 
        damping: 20,
        rotateY: { duration: 0.6 }
      }
    },
    eliminated: { 
      opacity: 0.15, 
      scale: 0.85,
      filter: 'grayscale(100%)',
      rotateX: 45,
      transition: { duration: 0.5, ease: 'easeOut' as const } 
    },
    owner: { 
      scale: 1.3, 
      y: -15,
      opacity: 1,
      rotateY: 360,
      filter: 'brightness(1.2) saturate(1.5)',
      transition: { 
        type: 'spring' as const, 
        stiffness: 200, 
        damping: 12,
        rotateY: { duration: 1.2, ease: 'easeInOut' as const }
      } 
    },
    flyOut: { 
      opacity: 0, 
      scale: 0.3, 
      y: -150,
      rotateZ: Math.random() * 360 - 180,
      transition: { duration: 0.6, ease: 'easeIn' as const } 
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

  useEffect(() => {
    if (isOwner && ownerRevealed) {
      // Epic owner reveal sequence
      controls.start({
        scale: [1, 1.5, 1.3],
        rotate: [0, 360, 0],
        transition: { duration: 1.5, ease: 'easeInOut' as const }
      });
    }
  }, [isOwner, ownerRevealed, controls]);

  const IconComponent = isOwner && ownerRevealed ? Crown : 
                        isOwner ? Star : 
                        Math.random() > 0.5 ? Sparkles : Users;

  return (
    <motion.div
      layout
      variants={cardVariants}
      initial="hidden"
      animate={getAnimationState()}
      className="relative flex flex-col items-center justify-center p-2 rounded-lg text-center w-[100px] h-[100px]"
      style={{ perspective: '1000px' }}
    >
      {/* Magical aura for owner */}
      {isOwner && ownerRevealed && (
        <motion.div
          className="absolute inset-0 rounded-lg gradient-holographic opacity-30 blur-sm"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut' as const
          }}
        />
      )}
      
      {/* Sparkle effects around owner */}
      {isOwner && ownerRevealed && (
        <motion.div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary rounded-full"
              style={{
                left: `${20 + Math.cos(i * Math.PI * 0.25) * 40}%`,
                top: `${20 + Math.sin(i * Math.PI * 0.25) * 40}%`,
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
                rotate: [0, 180]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.1,
                ease: 'easeInOut' as const
              }}
            />
          ))}
        </motion.div>
      )}
      
      <motion.div 
        className={`
          w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center border-2
          ${isOwner && ownerRevealed 
            ? 'bg-card neon-glow border-primary fortune-gradient' 
            : isEliminated 
            ? 'bg-muted border-muted-foreground'
            : 'bg-card/20 border-border/20 floating-shadow backdrop-blur-sm'
          }
        `}
        animate={
          isOwner && ownerRevealed 
            ? { 
                y: [0, -8, 0],
                rotate: [0, 5, -5, 0],
                scale: [1, 1.1, 1]
              }
            : isEliminated 
            ? { scale: 0.9, opacity: 0.5 }
            : { 
                y: [0, -3, 0],
                rotate: [0, 1, -1, 0]
              }
        }
        transition={{ 
          duration: isOwner && ownerRevealed ? 2 : 4, 
          repeat: Infinity, 
          ease: 'easeInOut' as const, 
          delay: Math.random() * 2 
        }}
      >
        <IconComponent 
          size={isOwner && ownerRevealed ? 36 : 28} 
          className={`
            ${isOwner && ownerRevealed 
              ? 'text-primary-foreground drop-shadow-lg' 
              : isEliminated 
              ? 'text-muted-foreground' 
              : 'text-muted-foreground'
            }
          `} 
        />
      </motion.div>
      
      <motion.p 
        className={`
          mt-2 text-xs font-semibold truncate w-24
          ${isOwner && ownerRevealed 
            ? 'text-primary font-bold text-sm' 
            : isEliminated 
            ? 'text-muted-foreground' 
            : 'text-card-foreground'
          }
        `}
        animate={
          isOwner && ownerRevealed 
            ? { 
                scale: [1, 1.1, 1],
                textShadow: ['0 0 0px #FFC000', '0 0 10px #FFC000', '0 0 0px #FFC000']
              }
            : {}
        }
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut' as const
        }}
      >
        {participant.name}
      </motion.p>
      
      {/* Victory burst for owner */}
      {isOwner && ownerRevealed && (
        <motion.div
          className="absolute top-0 left-1/2 transform -translate-x-1/2 text-primary"
          initial={{ scale: 0, y: 0 }}
          animate={{ 
            scale: [0, 1.5, 0],
            y: [0, -30, -60],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: 0.5
          }}
        >
          ✨
        </motion.div>
      )}
    </motion.div>
  );
};