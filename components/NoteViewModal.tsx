'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Pin, 
  Archive, 
  Trash2, 
  Edit2, 
  Clock,
  Calendar,
  Tag
} from 'lucide-react';
import { Note, NOTE_COLORS } from '@/types/note';
import { useNotes } from '@/context/NotesContext';
import { useEffect, useState } from 'react';

interface NoteViewModalProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (noteId: string) => void;
}

export default function NoteViewModal({ note, isOpen, onClose, onEdit }: NoteViewModalProps) {
  const { togglePin, toggleArchive, deleteNote } = useNotes();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!note) return null;

  const colorTheme = NOTE_COLORS.find(c => c.value === note.color) || NOTE_COLORS[0];

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      weekday: isMobile ? 'short' : 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEdit = () => {
    onClose();
    onEdit(note.id);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this note?')) {
      deleteNote(note.id);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-[#0f0f14] rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Color Header */}
            <div className={`h-24 bg-gradient-to-r ${note.color} relative`}>
              <div className="absolute inset-0 bg-black/10" />
              
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-black/30 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white hover:bg-black/50 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Status Badges */}
              <div className="absolute top-4 left-4 flex gap-2">
                {note.isPinned && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-yellow-500/20 backdrop-blur-sm text-yellow-300 text-xs font-medium border border-yellow-500/20">
                    <Pin className="w-3.5 h-3.5 fill-current" />
                    <span className="hidden sm:inline">Pinned</span>
                  </div>
                )}
                {note.isArchived && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/20 backdrop-blur-sm text-blue-300 text-xs font-medium border border-blue-500/20">
                    <Archive className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Archived</span>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 -mt-8 relative">
              {/* Icon */}
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${note.color} flex items-center justify-center shadow-lg mb-5 border-4 border-[#0f0f14]`}>
                <Tag className="w-7 h-7 text-white" />
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3 leading-tight">
                {note.title}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${colorTheme.bg} text-white border border-white/10`}>
                  {note.category}
                </span>
                
                <div className="flex items-center gap-1.5 text-white/40 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(note.createdAt)}</span>
                </div>
                
                <div className="flex items-center gap-1.5 text-white/40 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>Updated {formatDate(note.updatedAt)}</span>
                </div>
              </div>

              {/* Content */}
              <div className="bg-white/[0.02] rounded-xl p-5 mb-6 border border-white/[0.06]">
                <p className="text-white/80 text-base leading-relaxed whitespace-pre-wrap">
                  {note.content}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>

                <button
                  onClick={() => togglePin(note.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                    note.isPinned 
                      ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20' 
                      : 'bg-white/[0.04] text-white/70 border border-white/[0.08] hover:bg-white/[0.08]'
                  }`}
                >
                  <Pin className={`w-4 h-4 ${note.isPinned ? 'fill-current' : ''}`} />
                  {note.isPinned ? 'Unpin' : 'Pin'}
                </button>

                <button
                  onClick={() => toggleArchive(note.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                    note.isArchived 
                      ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20' 
                      : 'bg-white/[0.04] text-white/70 border border-white/[0.08] hover:bg-white/[0.08]'
                  }`}
                >
                  <Archive className="w-4 h-4" />
                  {note.isArchived ? 'Unarchive' : 'Archive'}
                </button>

                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 font-medium transition-all border border-red-500/20 ml-auto"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
