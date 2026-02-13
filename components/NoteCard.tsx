'use client';

import { motion } from 'framer-motion';
import { 
  Pin, 
  Archive, 
  Trash2, 
  Edit2, 
  Clock,
  Eye
} from 'lucide-react';
import { Note, NOTE_COLORS } from '@/types/note';
import { useNotes } from '@/context/NotesContext';

interface NoteCardProps {
  note: Note;
  onEdit: (id: string) => void;
  onView: (note: Note) => void;
}

export default function NoteCard({ note, onEdit, onView }: NoteCardProps) {
  const { togglePin, toggleArchive, deleteNote } = useNotes();

  const colorTheme = NOTE_COLORS.find(c => c.value === note.color) || NOTE_COLORS[0];

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;
    onView(note);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      onClick={handleCardClick}
      className="group relative rounded-2xl overflow-hidden cursor-pointer bg-white/[0.03] backdrop-blur-md border border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.06] transition-all duration-300 shadow-lg shadow-black/20"
    >
      {/* Glassmorphism Shine Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      {/* Color Accent Bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${note.color}`} />
      
      {/* Pinned Indicator */}
      {note.isPinned && (
        <div className="absolute top-4 right-4">
          <div className="w-7 h-7 rounded-lg bg-yellow-500/20 backdrop-blur-md border border-yellow-500/30 flex items-center justify-center shadow-lg">
            <Pin className="w-3.5 h-3.5 text-yellow-400 fill-current" />
          </div>
        </div>
      )}
      
      {/* Content */}
      <div className="relative p-5 flex flex-col h-full min-h-[200px]">
        {/* Title */}
        <h3 className="text-base font-semibold text-white mb-2 pr-10 line-clamp-1">
          {note.title}
        </h3>
        
        {/* Content Preview */}
        <p className="text-white/60 text-sm leading-relaxed mb-auto whitespace-pre-wrap line-clamp-3">
          {truncateContent(note.content)}
        </p>

        {/* Bottom Section */}
        <div className="mt-4 pt-4 border-t border-white/[0.08]">
          {/* Meta Row - Date and Category */}
          <div className="flex items-center justify-between mb-3">
            {/* Date */}
            <div className="flex items-center gap-1.5 text-white/40 text-xs">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatDate(note.updatedAt)}</span>
            </div>
            
            {/* Category Badge */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium bg-white/[0.06] backdrop-blur-sm text-white/60 border border-white/[0.08]">
              <div className={`w-1.5 h-1.5 rounded-full ${colorTheme.bg.replace('/20', '')}`} />
              {note.category}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onView(note);
              }}
              className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.08] backdrop-blur-sm transition-all"
              title="View"
            >
              <Eye className="w-4 h-4" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(note.id);
              }}
              className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.08] backdrop-blur-sm transition-all"
              title="Edit"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleArchive(note.id);
              }}
              className={`p-2 rounded-lg backdrop-blur-sm transition-all ${
                note.isArchived 
                  ? 'text-blue-400 bg-blue-500/15 border border-blue-500/20' 
                  : 'text-white/40 hover:text-white hover:bg-white/[0.08]'
              }`}
              title={note.isArchived ? 'Unarchive' : 'Archive'}
            >
              <Archive className="w-4 h-4" />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePin(note.id);
              }}
              className={`p-2 rounded-lg backdrop-blur-sm transition-all ${
                note.isPinned 
                  ? 'text-yellow-400 bg-yellow-500/15 border border-yellow-500/20' 
                  : 'text-white/40 hover:text-white hover:bg-white/[0.08]'
              }`}
              title={note.isPinned ? 'Unpin' : 'Pin'}
            >
              <Pin className={`w-4 h-4 ${note.isPinned ? 'fill-current' : ''}`} />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('Delete this note?')) {
                  deleteNote(note.id);
                }
              }}
              className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/15 backdrop-blur-sm transition-all"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
