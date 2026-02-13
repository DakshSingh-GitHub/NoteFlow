'use client';

import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick: () => void;
}

export default function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="fixed bottom-6 right-6 lg:bottom-8 lg:right-8 w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/30 z-30 group backdrop-blur-sm border border-white/10"
    >
      <Plus className="w-6 h-6 text-white" />
      
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-600 to-violet-600 blur-xl opacity-0 group-hover:opacity-40 transition-opacity -z-10" />
    </motion.button>
  );
}
