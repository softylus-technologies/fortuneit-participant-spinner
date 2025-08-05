import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface Participant {
  id: number;
  name: string;
}

interface OwnerAnnouncementProps {
  selectedOwner: Participant | null;
  onClose: () => void;
}

export const OwnerAnnouncement = ({ selectedOwner, onClose }: OwnerAnnouncementProps) => {
  if (!selectedOwner) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-background/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
        className="relative bg-card/90 border border-primary/30 rounded-2xl premium-shadow w-full max-w-lg text-center p-10"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground smooth-transition"
        >
          <X size={28} />
        </button>
        
        <motion.div
          className="mx-auto w-28 h-28 rounded-full fortune-gradient flex items-center justify-center glow-effect mb-6"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, ease: 'easeInOut' as const, repeat: Infinity }}
        >
          <span className="text-6xl" role="img" aria-label="handshake">🤝</span>
        </motion.div>
        
        <h2 className="text-4xl font-bold text-foreground">Owner Selected!</h2>
        <p className="text-xl text-muted-foreground mt-2">Congratulations to</p>
        
        <h1 className="text-6xl font-extrabold text-transparent bg-clip-text fortune-gradient mt-4">
          {selectedOwner.name}
        </h1>
      </motion.div>
    </motion.div>
  );
};