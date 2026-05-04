import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, X } from 'lucide-react';
import { Button } from '../components/ui/Button';

const FocusMode: React.FC<{ task: { title: string, id: string }, onExit: () => void }> = ({ task, onExit }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background-dark z-50 flex flex-col items-center justify-center p-8 text-white"
    >
      <Button 
        variant="ghost" 
        className="absolute top-8 right-8 text-white hover:bg-white/10"
        onClick={onExit}
      >
        <X className="w-6 h-6" />
      </Button>

      <div className="max-w-2xl w-full text-center space-y-12">
        <div className="space-y-4">
          <motion.h1 
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            className="text-4xl md:text-6xl font-bold tracking-tight"
          >
            {task.title}
          </motion.h1>
          <p className="text-text-secondary text-xl">Current Task</p>
        </div>

        <div className="py-20 relative">
          <div className="text-[120px] md:text-[200px] font-mono leading-none tracking-tighter tabular-nums">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          
          <div className="absolute inset-0 flex items-center justify-center -z-10 overflow-visible">
            <motion.div 
              animate={{ 
                scale: isActive ? [1, 1.2, 1] : 1,
                opacity: isActive ? [0.15, 0.3, 0.15] : 0.1,
                rotate: isActive ? [0, 90, 0] : 0
              }}
              transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
              className="absolute w-[400px] h-[400px] bg-primary rounded-full blur-[100px] -translate-x-1/4"
            />
            <motion.div 
              animate={{ 
                scale: isActive ? [1, 1.3, 1] : 1,
                opacity: isActive ? [0.1, 0.25, 0.1] : 0.05,
                rotate: isActive ? [0, -90, 0] : 0
              }}
              transition={{ repeat: Infinity, duration: 10, ease: "easeInOut", delay: 1 }}
              className="absolute w-[300px] h-[300px] bg-accent rounded-full blur-[100px] translate-x-1/3 translate-y-1/4"
            />
          </div>
        </div>

        <div className="flex items-center justify-center space-x-6">
          <Button 
            size="lg" 
            variant="ghost" 
            className="rounded-full w-16 h-16 bg-white/5 border-none"
            onClick={() => { setTimeLeft(25 * 60); setIsActive(false); }}
          >
            <RotateCcw className="w-8 h-8" />
          </Button>
          
          <Button 
            size="lg" 
            className="rounded-full w-24 h-24 bg-primary hover:bg-primary-dark border-none shadow-2xl shadow-primary/40"
            onClick={() => setIsActive(!isActive)}
          >
            {isActive ? <Pause className="w-10 h-10" /> : <Play className="w-10 h-10 ml-2" />}
          </Button>

          <Button 
            size="lg" 
            variant="ghost" 
            className="rounded-full w-16 h-16 bg-white/5 border-none"
          >
            <CheckCircle2Icon className="w-8 h-8" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

// Helper component
const CheckCircle2Icon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
    <path d="m9 12 2 2 4-4"/>
  </svg>
);

export default FocusMode;
