'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, ChevronDown, Check, Palette } from 'lucide-react';
import { useNotes } from '@/context/NotesContext';
import { CATEGORIES, NOTE_COLORS, NoteCategory } from '@/types/note';
import { useState, useEffect, useRef } from 'react';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingNoteId: string | null;
}

export default function NoteModal({ isOpen, onClose, editingNoteId }: NoteModalProps) {
  const { addNote, updateNote, notes } = useNotes();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<NoteCategory>(CATEGORIES[0]);
  const [color, setColor] = useState(NOTE_COLORS[0].value);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);

  const editingNote = editingNoteId ? notes.find(n => n.id === editingNoteId) : null;

  useEffect(() => {
    if (editingNote) {
      setTitle(editingNote.title);
      setContent(editingNote.content);
      setCategory(editingNote.category as NoteCategory);
      setColor(editingNote.color);
    } else {
      setTitle('');
      setContent('');
      setCategory(CATEGORIES[0]);
      setColor(NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)].value);
    }
  }, [editingNote, isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        setIsCategoryOpen(false);
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
        setIsCategoryOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        window.removeEventListener('keydown', handleEscape);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    
    try {
      if (editingNoteId) {
        updateNote(editingNoteId, {
          title: title.trim(),
          content: content.trim(),
          category,
          color,
        });
      } else {
        addNote({
          title: title.trim(),
          content: content.trim(),
          category,
          color,
          isPinned: false,
          isArchived: false,
        });
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get color display name and gradient
  const selectedColorName = NOTE_COLORS.find(c => c.value === color)?.name || 'Purple';
  
  // Get gradient colors for inline style
  const getGradientStyle = (colorValue: string) => {
    const gradientColors = colorValue.replace('from-', '').replace('to-', '').split(' ');
    const fromColor = gradientColors[0];
    const toColor = gradientColors[1] || gradientColors[0];
    return {
      background: `linear-gradient(90deg, ${getColorHex(fromColor)}, ${getColorHex(toColor)})`
    };
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            onClose();
            setIsCategoryOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-[#0f0f14] rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl"
          >
            {/* Color Header */}
            <div className="h-3" style={getGradientStyle(color)} />
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <h2 className="text-lg font-semibold text-white">
                {editingNoteId ? 'Edit Note' : 'Create Note'}
              </h2>
              <button
                onClick={() => {
                  onClose();
                  setIsCategoryOpen(false);
                }}
                className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.08] transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Title Input */}
              <div>
                <label className="block text-xs font-medium text-white/40 mb-2 uppercase tracking-wider">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter note title..."
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.05] transition-all"
                  autoFocus
                />
              </div>

              {/* Content Input */}
              <div>
                <label className="block text-xs font-medium text-white/40 mb-2 uppercase tracking-wider">
                  Content
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your note here..."
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.05] transition-all resize-none"
                />
              </div>

              {/* Category & Color */}
              <div className="grid grid-cols-2 gap-4">
                {/* Custom Category Dropdown */}
                <div ref={categoryRef} className="relative">
                  <label className="block text-xs font-medium text-white/40 mb-2 uppercase tracking-wider">
                    Category
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.05] transition-all flex items-center justify-between hover:bg-white/[0.05]"
                  >
                    <span>{category}</span>
                    <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {isCategoryOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a24] border border-white/[0.08] rounded-xl overflow-hidden shadow-xl z-50"
                      >
                        <div className="max-h-48 overflow-y-auto py-1">
                          {CATEGORIES.map((cat) => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => {
                                setCategory(cat);
                                setIsCategoryOpen(false);
                              }}
                              className={`w-full px-4 py-2.5 text-left text-sm transition-all flex items-center justify-between ${
                                category === cat 
                                  ? 'bg-purple-500/15 text-purple-300' 
                                  : 'text-white/70 hover:bg-white/[0.05] hover:text-white'
                              }`}
                            >
                              <span>{cat}</span>
                              {category === cat && (
                                <Check className="w-4 h-4 text-purple-400" />
                              )}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Color Selector */}
                <div>
                  <label className="block text-xs font-medium text-white/40 mb-2 uppercase tracking-wider">
                    Color
                  </label>
                  <div className="flex items-center gap-2">
                    {NOTE_COLORS.slice(0, 5).map((c) => {
                      // Parse the gradient colors for inline style
                      const gradientColors = c.value.replace('from-', '').replace('to-', '').split(' ');
                      const fromColor = gradientColors[0];
                      const toColor = gradientColors[1] || gradientColors[0];
                      
                      return (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => setColor(c.value)}
                          className={`w-9 h-9 rounded-lg transition-all duration-200 relative overflow-hidden ${
                            color === c.value 
                              ? 'ring-2 ring-white/80 scale-110 shadow-lg' 
                              : 'hover:scale-105 opacity-80 hover:opacity-100'
                          }`}
                          title={c.name}
                        >
                          <div 
                            className="absolute inset-0"
                            style={{
                              background: `linear-gradient(135deg, ${getColorHex(fromColor)}, ${getColorHex(toColor)})`
                            }}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setIsCategoryOpen(false);
                  }}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/70 font-medium hover:bg-white/[0.08] hover:text-white transition-all"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={!title.trim() || isSubmitting}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/20 transition-all"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {editingNoteId ? 'Update' : 'Create'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Helper function to convert Tailwind color classes to hex
function getColorHex(colorClass: string): string {
  const colorMap: Record<string, string> = {
    'purple-600': '#9333ea',
    'fuchsia-600': '#c026d3',
    'blue-600': '#2563eb',
    'cyan-500': '#06b6d4',
    'emerald-600': '#059669',
    'teal-500': '#14b8a6',
    'orange-600': '#ea580c',
    'amber-500': '#f59e0b',
    'rose-600': '#e11d48',
    'red-600': '#dc2626',
  };
  
  // Extract the color name from the class
  const match = colorClass.match(/(purple|fuchsia|blue|cyan|emerald|teal|orange|amber|rose|red)-(\d+)/);
  if (match) {
    const key = `${match[1]}-${match[2]}`;
    return colorMap[key] || '#9333ea';
  }
  
  return '#9333ea';
}
