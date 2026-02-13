'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { FileX, Sparkles, Search } from 'lucide-react';
import { useNotes } from '@/context/NotesContext';
import { Note } from '@/types/note';
import NoteCard from './NoteCard';

interface NoteGridProps {
  onEdit: (id: string) => void;
  onView: (note: Note) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25
    }
  }
};

export default function NoteGrid({ onEdit, onView }: NoteGridProps) {
  const { filteredNotes, filters } = useNotes();

  const pinnedNotes = filteredNotes.filter(n => n.isPinned);
  const unpinnedNotes = filteredNotes.filter(n => !n.isPinned);

  if (filteredNotes.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-24 text-center"
      >
        <div className="w-24 h-24 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mb-6">
          {filters.searchQuery ? (
            <Search className="w-10 h-10 text-white/20" />
          ) : (
            <Sparkles className="w-10 h-10 text-white/20" />
          )}
        </div>
        
        <h3 className="text-xl font-semibold text-white mb-2">
          {filters.searchQuery ? 'No notes found' : 'No notes yet'}
        </h3>
        <p className="text-white/40 max-w-sm text-sm">
          {filters.searchQuery 
            ? `No notes matching "${filters.searchQuery}". Try a different search term.`
            : 'Get started by creating your first note. Click the + button below.'
          }
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Pinned Section */}
      {pinnedNotes.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 rounded-full bg-yellow-400" />
            <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider">
              Pinned
            </h2>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            <AnimatePresence mode="popLayout">
              {pinnedNotes.map((note) => (
                <motion.div key={note.id} variants={itemVariants} layout>
                  <NoteCard note={note} onEdit={onEdit} onView={onView} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </section>
      )}

      {/* Others Section */}
      {unpinnedNotes.length > 0 && (
        <section>
          {pinnedNotes.length > 0 && (
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider">
                Others
              </h2>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>
          )}
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            <AnimatePresence mode="popLayout">
              {unpinnedNotes.map((note) => (
                <motion.div key={note.id} variants={itemVariants} layout>
                  <NoteCard note={note} onEdit={onEdit} onView={onView} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </section>
      )}
    </div>
  );
}
