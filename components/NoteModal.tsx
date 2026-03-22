'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, ChevronDown, Check, Type, Eraser } from 'lucide-react';
import { useNotes } from '@/context/NotesContext';
import { CATEGORIES, NOTE_COLORS, NoteCategory } from '@/types/note';
import { useState, useEffect, useRef } from 'react';
import {
  normalizeContentForEditor,
  sanitizeRichHtml,
  stripHtml,
} from '@/lib/richText';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingNoteId: string | null;
}

const FONT_SIZE_OPTIONS = [
  { label: 'Small', px: 14, legacy: '3' },
  { label: 'Normal', px: 16, legacy: '4' },
  { label: 'Large', px: 20, legacy: '5' },
  { label: 'XL', px: 24, legacy: '6' },
  { label: 'XXL', px: 30, legacy: '7' },
];

export default function NoteModal({ isOpen, onClose, editingNoteId }: NoteModalProps) {
  const { addNote, updateNote, notes } = useNotes();
  const [title, setTitle] = useState('');
  const [contentHtml, setContentHtml] = useState('');
  const [category, setCategory] = useState<NoteCategory>(CATEGORIES[0]);
  const [color, setColor] = useState(NOTE_COLORS[0].value);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [selectedTextColor, setSelectedTextColor] = useState('#f8fafc');
  const [selectedFontLegacy, setSelectedFontLegacy] = useState('4');

  const editorRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);

  const editingNote = editingNoteId ? notes.find((n) => n.id === editingNoteId) : null;

  useEffect(() => {
    const nextContent = editingNote
      ? normalizeContentForEditor(editingNote.content)
      : '';

    if (editingNote) {
      setTitle(editingNote.title);
      setContentHtml(nextContent);
      setCategory(editingNote.category as NoteCategory);
      setColor(editingNote.color);
    } else {
      setTitle('');
      setContentHtml(nextContent);
      setCategory(CATEGORIES[0]);
      setColor(NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)].value);
    }
    if (isOpen && editorRef.current) {
      editorRef.current.innerHTML = nextContent;
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

  const syncEditorContent = () => {
    if (!editorRef.current) return;
    setContentHtml(editorRef.current.innerHTML);
  };

  const applyCommand = (command: string, value?: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand('styleWithCSS', false, 'true');
    document.execCommand(command, false, value);
    normalizeLegacyFontTags(editorRef.current);
    syncEditorContent();
  };

  const handleTextColorChange = (newColor: string) => {
    setSelectedTextColor(newColor);
    applyCommand('foreColor', newColor);
  };

  const handleFontSizeChange = (legacySize: string) => {
    setSelectedFontLegacy(legacySize);
    applyCommand('fontSize', legacySize);
  };

  const clearFormatting = () => {
    applyCommand('removeFormat');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const safeContent = sanitizeRichHtml(editorRef.current?.innerHTML || contentHtml);
    setIsSubmitting(true);

    try {
      if (editingNoteId) {
        updateNote(editingNoteId, {
          title: title.trim(),
          content: safeContent,
          category,
          color,
        });
      } else {
        addNote({
          title: title.trim(),
          content: safeContent,
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

  const selectedColorName = NOTE_COLORS.find((c) => c.value === color)?.name || 'Purple';

  const getGradientStyle = (colorValue: string) => {
    const gradientColors = colorValue.replace('from-', '').replace('to-', '').split(' ');
    const fromColor = gradientColors[0];
    const toColor = gradientColors[1] || gradientColors[0];
    return {
      background: `linear-gradient(90deg, ${getColorHex(fromColor)}, ${getColorHex(toColor)})`,
    };
  };

  const isEditorEmpty = stripHtml(contentHtml).length === 0;

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
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            onClick={(e) => e.stopPropagation()}
            className="w-[92vw] md:w-[70vw] max-w-6xl h-[88vh] max-h-[880px] bg-[#0f0f14] rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl flex flex-col"
          >
            <div className="h-2.5" style={getGradientStyle(color)} />

            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {editingNoteId ? 'Edit Note' : 'Create Note'}
                </h2>
                <p className="text-xs text-white/45 mt-1">
                  Elegant writing with rich text formatting.
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  setIsCategoryOpen(false);
                }}
                className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.08] transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 flex-1 min-h-0 flex flex-col">
              <div className="grid grid-cols-1 lg:grid-cols-[1.9fr_1fr] gap-6 flex-1 min-h-0 ">
                <div className="space-y-4 min-h-0 flex flex-col pb-3">
                  <div>
                    <label className="block text-xs font-medium text-white/40 mb-2 uppercase tracking-wider">
                      Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Give your note a compelling title..."
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.05] transition-all"
                      autoFocus
                    />
                  </div>

                  <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden flex flex-col flex-1 min-h-0 ">
                    <div className="flex flex-wrap items-center gap-2 p-3 border-b border-white/[0.08] bg-white/[0.02]">
                      <button
                        type="button"
                        onClick={() => applyCommand('bold')}
                        className="px-3 py-1.5 rounded-lg bg-white/[0.04] text-white/85 hover:bg-white/[0.1] border border-white/[0.08] text-sm font-semibold transition-all"
                        title="Bold"
                      >
                        B
                      </button>
                      <button
                        type="button"
                        onClick={() => applyCommand('italic')}
                        className="px-3 py-1.5 rounded-lg bg-white/[0.04] text-white/85 hover:bg-white/[0.1] border border-white/[0.08] text-sm italic transition-all"
                        title="Italic"
                      >
                        I
                      </button>
                      <button
                        type="button"
                        onClick={() => applyCommand('underline')}
                        className="px-3 py-1.5 rounded-lg bg-white/[0.04] text-white/85 hover:bg-white/[0.1] border border-white/[0.08] text-sm underline transition-all"
                        title="Underline"
                      >
                        U
                      </button>

                      <div className="h-6 w-px bg-white/[0.08]" />

                      <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/75 text-xs">
                        <Type className="w-3.5 h-3.5" />
                        <select
                          value={selectedFontLegacy}
                          onChange={(e) => handleFontSizeChange(e.target.value)}
                          className="bg-transparent text-white text-xs outline-none"
                        >
                          {FONT_SIZE_OPTIONS.map((option) => (
                            <option key={option.legacy} value={option.legacy} className="bg-[#11131b]">
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/75 text-xs">
                        <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: selectedTextColor }} />
                        <input
                          type="color"
                          value={selectedTextColor}
                          onChange={(e) => handleTextColorChange(e.target.value)}
                          className="w-6 h-6 rounded bg-transparent border-0 p-0 cursor-pointer"
                          title="Text color"
                        />
                      </label>

                      <button
                        type="button"
                        onClick={clearFormatting}
                        className="px-3 py-1.5 rounded-lg bg-white/[0.04] text-white/75 hover:bg-white/[0.1] border border-white/[0.08] text-xs transition-all inline-flex items-center gap-1.5"
                      >
                        <Eraser className="w-3.5 h-3.5" />
                        Clear
                      </button>
                    </div>

                    <div className="relative flex-1 min-h-0">
                      {isEditorEmpty && (
                        <div className="pointer-events-none absolute top-0 left-0 p-4 text-white/25 text-sm">
                          Write your note... select text to apply size, color, bold, italic, underline.
                        </div>
                      )}
                      <div
                        ref={editorRef}
                        contentEditable
                        suppressContentEditableWarning
                        onInput={syncEditorContent}
                        onPaste={(e) => {
                          e.preventDefault();
                          const text = e.clipboardData.getData('text/plain');
                          document.execCommand('insertText', false, text);
                          syncEditorContent();
                        }}
                        className="note-editor h-full overflow-y-auto p-4 text-white/90 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div ref={categoryRef} className="relative rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
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
                          className="absolute top-[82px] left-4 right-4 bg-[#1a1a24] border border-white/[0.08] rounded-xl overflow-hidden shadow-xl z-50"
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
                                {category === cat && <Check className="w-4 h-4 text-purple-400" />}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                    <label className="block text-xs font-medium text-white/40 mb-2 uppercase tracking-wider">
                      Color Theme
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {NOTE_COLORS.slice(0, 10).map((c) => {
                        const gradientColors = c.value.replace('from-', '').replace('to-', '').split(' ');
                        const fromColor = gradientColors[0];
                        const toColor = gradientColors[1] || gradientColors[0];

                        return (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => setColor(c.value)}
                            className={`w-full aspect-square rounded-lg transition-all duration-200 relative overflow-hidden ${
                              color === c.value
                                ? 'ring-2 ring-white/80 scale-105 shadow-lg'
                                : 'hover:scale-105 opacity-80 hover:opacity-100'
                            }`}
                            title={c.name}
                          >
                            <div
                              className="absolute inset-0"
                              style={{
                                background: `linear-gradient(135deg, ${getColorHex(fromColor)}, ${getColorHex(toColor)})`,
                              }}
                            />
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-xs text-white/45 mt-3">
                      Active palette: <span className="text-white/75">{selectedColorName}</span>
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-4 mb-3">
                    <p className="text-xs uppercase tracking-wider text-white/35 mb-2">Editor Tips</p>
                    <ul className="text-xs text-white/60 space-y-1.5">
                      <li>Select text then click toolbar controls.</li>
                      <li>Use color + size to highlight priorities.</li>
                      <li>Formatting stays intact in saved notes.</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6 mt-8 border-t border-white/[0.06]">
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
                      {editingNoteId ? 'Update Note' : 'Create Note'}
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

function normalizeLegacyFontTags(editor: HTMLDivElement) {
  const legacyNodes = editor.querySelectorAll('font[size]');
  legacyNodes.forEach((node) => {
    const size = node.getAttribute('size');
    const mapped = FONT_SIZE_OPTIONS.find((opt) => opt.legacy === size)?.px || 16;
    const span = document.createElement('span');
    span.style.fontSize = `${mapped}px`;
    span.innerHTML = node.innerHTML;
    node.replaceWith(span);
  });
}

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
    'pink-600': '#db2777',
    'yellow-500': '#eab308',
    'indigo-600': '#4f46e5',
    'purple-700': '#7e22ce',
    'sky-500': '#0ea5e9',
    'lime-500': '#84cc16',
    'green-600': '#16a34a',
    'violet-600': '#7c3aed',
    'slate-600': '#475569',
    'gray-600': '#4b5563',
  };

  const match = colorClass.match(/([a-z]+-\d+)/);
  if (match) {
    return colorMap[match[1]] || '#9333ea';
  }
  return '#9333ea';
}
