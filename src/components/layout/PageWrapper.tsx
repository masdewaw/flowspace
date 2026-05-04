import React from 'react';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

interface PageWrapperProps {
  children: React.ReactNode;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ children }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-background relative text-text-primary transition-all duration-500">
      {/* Ambient Premium Background - Subtle & High Performance */}
      <div className="absolute top-[-15%] left-[-5%] w-[500px] h-[500px] bg-primary/5 dark:bg-primary/[0.03] rounded-full blur-[120px] pointer-events-none animate-pulse-soft" />
      <div className="absolute bottom-[-15%] right-[-5%] w-[500px] h-[500px] bg-accent/5 dark:bg-accent/[0.03] rounded-full blur-[120px] pointer-events-none animate-pulse-soft" style={{ animationDelay: '1s' }} />
      
      <div className="z-10 h-full py-4 pl-4 pr-2">
        <Sidebar />
      </div>
      
      <div className="flex-1 flex flex-col min-w-0 z-10 py-4 pr-4 pl-2 h-full relative">
        <div className="bg-surface/60 dark:bg-surface/40 backdrop-blur-3xl border border-border/50 rounded-[2.5rem] shadow-premium flex-1 flex flex-col overflow-hidden relative transition-all duration-500">
          <TopBar />
          <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 p-8 md:p-12 overflow-y-auto custom-scrollbar"
          >
            {children}
          </motion.main>
        </div>
      </div>
    </div>
  );
};

export default PageWrapper;
