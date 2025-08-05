import { motion, AnimatePresence } from 'framer-motion';
import { User } from 'lucide-react';

interface RecentParticipant {
  id: number;
  name: string;
  timestamp: number;
}

interface RecentParticipantsFeedProps {
  recentParticipants: RecentParticipant[];
}

export const RecentParticipantsFeed = ({ recentParticipants }: RecentParticipantsFeedProps) => {
  return (
    <div className="w-full max-w-sm mx-auto mt-6">
      <h3 className="text-center text-lg font-semibold text-card-foreground mb-3">
        Recent Participants
      </h3>
      
      <div className="relative bg-card rounded-xl p-3 premium-shadow border border-border/20">
        <div 
          className="absolute -inset-px rounded-xl border border-transparent bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 animate-pulse"
          style={{ animationDelay: '1s' }}
        />
        
        <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-card to-transparent z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-card to-transparent z-10 pointer-events-none" />
        
        <div className="h-56 overflow-hidden">
          <AnimatePresence initial={false}>
            <motion.ul>
              {recentParticipants.map((participant, index) => (
                <motion.li
                  key={participant.timestamp}
                  layout
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50, transition: { duration: 0.2 } }}
                  transition={{ type: 'spring' as const, stiffness: 250, damping: 25 }}
                  className={`flex items-center gap-4 p-3 ${
                    index !== recentParticipants.length - 1 
                      ? 'border-b border-border/30' 
                      : ''
                  }`}
                >
                  <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    transition={{ delay: 0.1 }}
                    className="w-9 h-9 rounded-full bg-gradient-to-br from-muted to-secondary flex items-center justify-center text-primary shadow-inner"
                  >
                    <User size={18} />
                  </motion.div>
                  <span className="text-card-foreground font-medium text-sm">
                    {participant.name}
                  </span>
                </motion.li>
              ))}
            </motion.ul>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};