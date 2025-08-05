import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, PlayCircle } from 'lucide-react';
import { OwnerSelectionDialog } from './OwnerSelectionDialog';
import { RecentParticipantsFeed } from './RecentParticipantsFeed';
import { initialParticipants, type Participant } from '@/data/participants';

interface RecentParticipant extends Participant {
  timestamp: number;
}

export const FortuneItApp = () => {
  const [showOwnerSelection, setShowOwnerSelection] = useState(false);
  const [progress, setProgress] = useState(0);
  const [recentParticipants, setRecentParticipants] = useState<RecentParticipant[]>([]);

  // Simulate loading progress
  useEffect(() => {
    if (showOwnerSelection) return;
    
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 5;
        if (newProgress >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => setShowOwnerSelection(true), 1500);
          return 100;
        }
        return newProgress;
      });
    }, 400);
    
    return () => clearInterval(progressInterval);
  }, [showOwnerSelection]);

  // Simulate new participants joining
  useEffect(() => {
    if (showOwnerSelection) return;
    
    const participantInterval = setInterval(() => {
      const randomParticipant = initialParticipants[
        Math.floor(Math.random() * initialParticipants.length)
      ];
      const newEntry: RecentParticipant = { 
        ...randomParticipant, 
        timestamp: Date.now() 
      };
      setRecentParticipants(prev => [newEntry, ...prev].slice(0, 8));
    }, 2500);

    return () => clearInterval(participantInterval);
  }, [showOwnerSelection]);

  const formattedProgress = useMemo(() => {
    const p = Math.min(100, progress);
    return p.toFixed(2);
  }, [progress]);

  return (
    <div className="w-full min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="p-4 flex justify-center items-center">
        <div className="flex items-center gap-3">
          <img 
            src="https://api.fortuneitholdings.com/static/images/logo-without-name.svg" 
            alt="FORTUNEiT Logo" 
            className="h-10" 
          />
          <span className="text-3xl font-bold text-foreground tracking-wider">
            FORTUNEiT
          </span>
        </div>
      </header>

      <main className="flex flex-col items-center justify-center p-4 pb-8">
        {/* Main Product Card */}
        <div className="w-full max-w-sm mx-auto bg-card rounded-2xl overflow-hidden premium-shadow">
          <div className="p-1">
            <img 
              src="https://api.fortuneitholdings.com/media/listing/Apple-iPhone-16-Pro-hero-240909-lp.jpg.news_app_ed.jpg" 
              alt="iPhone 16 Pro" 
              className="w-full h-auto object-cover rounded-xl"
              onError={(e) => { 
                const target = e.target as HTMLImageElement;
                target.onerror = null; 
                target.src = 'https://placehold.co/600x400/1C1C1E/FFFFFF?text=Image+Not+Found'; 
              }}
            />
          </div>
          
          <div className="p-5 pt-3">
            <h1 className="text-xl font-bold text-card-foreground">
              Apple iPhone 16 Pro Max (256GB)
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Premium titanium design. Powerful A18 Pro. The best iPhone camera system yet.
            </p>

            <div className="mt-6">
              <div className="flex justify-between items-center text-sm mb-1">
                <span className="font-medium text-card-foreground">
                  Participants Progress
                </span>
                <span className="font-semibold text-primary">
                  {formattedProgress}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <motion.div
                  className="fortune-gradient h-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "linear", duration: 0.2 }}
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-6 w-full flex items-center justify-center gap-2 fortune-gradient text-primary-foreground font-bold py-3 rounded-lg glow-effect text-lg smooth-transition focus:outline-none focus:ring-4 focus:ring-primary/50"
            >
              <ShoppingBag size={20} />
              <span>JOD 1.96</span>
            </motion.button>
          </div>
        </div>

        {/* Recent Participants Feed */}
        <RecentParticipantsFeed recentParticipants={recentParticipants} />

        {/* Development Helper Button */}
        <button
          onClick={() => setShowOwnerSelection(true)}
          className="flex mt-6 items-center gap-2 bg-secondary text-secondary-foreground font-semibold py-2 px-4 rounded-lg hover:bg-secondary/80 smooth-transition text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50"
        >
          <PlayCircle size={16} />
          (Dev) Play Animation
        </button>
      </main>

      <AnimatePresence>
        {showOwnerSelection && (
          <OwnerSelectionDialog
            participants={initialParticipants}
            onClose={() => {
              setShowOwnerSelection(false);
              setProgress(0);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};