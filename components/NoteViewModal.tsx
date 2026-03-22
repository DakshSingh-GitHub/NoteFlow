'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Pin, 
  Archive, 
  Trash2, 
  Edit2, 
  Clock,
  Calendar
} from 'lucide-react';
import { Note, NOTE_COLORS } from '@/types/note';
import { useNotes } from '@/context/NotesContext';
import { useEffect, useState } from 'react';
import { sanitizeRichHtml } from '@/lib/richText';

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
            className="w-[94vw] md:w-[82vw] max-w-6xl h-[90vh] max-h-[920px] bg-[#0f0f14] rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl flex flex-col"
          >
            <div className={`h-1.5 bg-gradient-to-r ${note.color}`} />

            {/* Header */}
            <div className="px-6 py-5 border-b border-white/[0.08] bg-white/[0.01]">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight break-words">
                    {note.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${colorTheme.bg} text-white border border-white/10`}>
                      {note.category}
                    </span>
                    {note.isPinned && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-yellow-500/20 text-yellow-300 text-xs font-medium border border-yellow-500/20">
                        <Pin className="w-3.5 h-3.5 fill-current" />
                        Pinned
                      </span>
                    )}
                    {note.isArchived && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 text-xs font-medium border border-blue-500/20">
                        <Archive className="w-3.5 h-3.5" />
                        Archived
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/70 hover:text-white hover:bg-white/[0.08] transition-all shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 flex-1 min-h-0 flex flex-col">
              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 mb-4">
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
              <div className="bg-white/[0.02] rounded-xl p-5 border border-white/[0.06] flex-1 min-h-0 overflow-y-auto">
                <div
                  className="note-rich-content text-white/80 text-base leading-relaxed whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(note.content) }}
                />
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-4 mt-4 border-t border-white/[0.06]">
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
