import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, PlayCircle } from 'lucide-react';
import { OwnerSelectionDialog } from './OwnerSelectionDialog';
import { RecentParticipantsFeed } from './RecentParticipantsFeed';
import { type Participant } from '@/data/participants';
import { fetchListingWinner, type ParticipantData } from '@/services/api';

interface RecentParticipant extends Participant {
  timestamp: number;
}

export const FortuneItApp = () => {
  const [showOwnerSelection, setShowOwnerSelection] = useState(false);
  const [progress, setProgress] = useState(0);
  const [recentParticipants, setRecentParticipants] = useState<RecentParticipant[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [winner, setWinner] = useState<ParticipantData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const listingId = 199; // This can be made dynamic later

  // Fetch listing data
  useEffect(() => {
    const loadListingData = async () => {
      try {
        setIsLoading(true);
        const response = await fetchListingWinner(listingId);
        
        // Convert API data to Participant format
        const convertedParticipants: Participant[] = response.data.map(p => ({
          id: p.id,
          name: `${p.user.first_name} ${p.user.last_name}`,
          email: p.user.email,
          userId: p.user.id
        }));
        
        setParticipants(convertedParticipants);
        setWinner(response.winner);
        setProgress(response.purchase_percentage);
        
        // Show owner selection when progress reaches 100%
        if (response.purchase_percentage >= 100) {
          setTimeout(() => setShowOwnerSelection(true), 1500);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        console.error('Error loading listing data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadListingData();
  }, []);

  // Simulate new participants joining from real data
  useEffect(() => {
    if (showOwnerSelection || participants.length === 0) return;
    
    const participantInterval = setInterval(() => {
      const randomParticipant = participants[
        Math.floor(Math.random() * participants.length)
      ];
      const newEntry: RecentParticipant = { 
        ...randomParticipant, 
        timestamp: Date.now() 
      };
      setRecentParticipants(prev => [newEntry, ...prev].slice(0, 8));
    }, 2500);

    return () => clearInterval(participantInterval);
  }, [showOwnerSelection, participants]);

  const formattedProgress = useMemo(() => {
    const p = Math.min(100, progress);
    return p.toFixed(2);
  }, [progress]);

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading participants...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <div className="text-4xl">⚠️</div>
          <h2 className="text-xl font-bold text-destructive">Error Loading Data</h2>
          <p className="text-muted-foreground">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
        <motion.div 
          className="w-full max-w-sm mx-auto bg-card rounded-2xl overflow-hidden epic-shadow relative"
          whileHover={{ y: -5 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {/* Holographic border effect */}
          <motion.div
            className="absolute -inset-0.5 gradient-holographic rounded-2xl opacity-0"
            whileHover={{ opacity: 0.3 }}
            transition={{ duration: 0.3 }}
          />
          
          <div className="relative bg-card rounded-2xl">
            <div className="p-1">
              <motion.img 
                src="https://api.fortuneitholdings.com/media/listing/Apple-iPhone-16-Pro-hero-240909-lp.jpg.news_app_ed.jpg" 
                alt="iPhone 16 Pro" 
                className="w-full h-auto object-cover rounded-xl"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
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
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 0 30px hsl(var(--primary) / 0.6)"
                }}
                whileTap={{ scale: 0.98 }}
                className="mt-6 w-full flex items-center justify-center gap-2 fortune-gradient text-primary-foreground font-bold py-3 rounded-lg pulse-glow text-lg elastic-transition focus:outline-none focus:ring-4 focus:ring-primary/50 relative overflow-hidden"
              >
                <motion.div
                  className="absolute inset-0 shimmer"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' as const }}
                />
                <ShoppingBag size={20} className="relative z-10" />
                <span className="relative z-10">JOD 1.96</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Recent Participants Feed */}
        <RecentParticipantsFeed recentParticipants={recentParticipants} />

        {/* Development Helper Button */}
        <motion.button
          onClick={() => setShowOwnerSelection(true)}
          whileHover={{ 
            scale: 1.05,
            backgroundColor: "hsl(var(--secondary) / 0.8)",
            boxShadow: "0 5px 15px hsl(var(--secondary) / 0.3)"
          }}
          whileTap={{ scale: 0.95 }}
          className="flex mt-6 items-center gap-2 bg-secondary text-secondary-foreground font-semibold py-2 px-4 rounded-lg dramatic-transition text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 relative overflow-hidden"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.6 }}
          />
          <PlayCircle size={16} className="relative z-10" />
          <span className="relative z-10">(Dev) Play Animation</span>
        </motion.button>
      </main>

      <AnimatePresence>
        {showOwnerSelection && (
          <OwnerSelectionDialog
            participants={participants}
            onClose={() => {
              setShowOwnerSelection(false);
              // Don't reset progress since it comes from API
            }}
            winner={winner}
          />
        )}
      </AnimatePresence>
    </div>
  );
};