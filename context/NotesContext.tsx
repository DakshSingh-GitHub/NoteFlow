'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { Note, FilterState, CATEGORIES, NOTE_COLORS } from '@/types/note';

interface NotesContextType {
  notes: Note[];
  filteredNotes: Note[];
  filters: FilterState;
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  togglePin: (id: string) => void;
  toggleArchive: (id: string) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  categories: string[];
  stats: {
    total: number;
    pinned: number;
    archived: number;
    byCategory: Record<string, number>;
  };
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

const generateId = () => Math.random().toString(36).substr(2, 9);

const getRandomColor = () => NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)];

const initialNotes: Note[] = [
  {
    id: '1',
    title: 'Welcome to NoteFlow',
    content: 'This is your new digital notebook. Create beautiful notes, organize them with categories, and enjoy a seamless experience.\n\nFeatures:\n✨ Stunning animations\n📱 Fully responsive\n🎨 Multiple color themes\n🔍 Powerful search\n📌 Pin important notes',
    category: 'Personal',
    color: 'from-purple-600 to-fuchsia-600',
    createdAt: new Date(),
    updatedAt: new Date(),
    isPinned: true,
    isArchived: false,
  },
  {
    id: '2',
    title: 'Project Ideas',
    content: '1. AI-powered personal assistant\n2. Smart home automation\n3. Fitness tracking app\n4. Recipe recommendation system\n5. Language learning platform',
    category: 'Ideas',
    color: 'from-blue-600 to-cyan-500',
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(Date.now() - 86400000),
    isPinned: false,
    isArchived: false,
  },
  {
    id: '3',
    title: 'Weekly Tasks',
    content: '• Complete project proposal\n• Schedule team meeting\n• Review pull requests\n• Update documentation\n• Prepare presentation',
    category: 'Tasks',
    color: 'from-emerald-600 to-teal-500',
    createdAt: new Date(Date.now() - 172800000),
    updatedAt: new Date(Date.now() - 172800000),
    isPinned: false,
    isArchived: false,
  },
];

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filters, setFiltersState] = useState<FilterState>({
    category: null,
    searchQuery: '',
    showArchived: false,
    showPinned: false,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('notes');
    if (saved) {
      const parsed = JSON.parse(saved);
      setNotes(parsed.map((n: Note) => ({
        ...n,
        createdAt: new Date(n.createdAt),
        updatedAt: new Date(n.updatedAt),
      })));
    } else {
      setNotes(initialNotes);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('notes', JSON.stringify(notes));
    }
  }, [notes, isLoaded]);

  const addNote = (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote: Note = {
      ...noteData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setNotes(prev => [newNote, ...prev]);
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(prev =>
      prev.map(note =>
        note.id === id
          ? { ...note, ...updates, updatedAt: new Date() }
          : note
      )
    );
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  };

  const togglePin = (id: string) => {
    setNotes(prev =>
      prev.map(note =>
        note.id === id ? { ...note, isPinned: !note.isPinned } : note
      )
    );
  };

  const toggleArchive = (id: string) => {
    setNotes(prev =>
      prev.map(note =>
        note.id === id ? { ...note, isArchived: !note.isArchived } : note
      )
    );
  };

  const setFilters = (newFilters: Partial<FilterState>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  };

  const filteredNotes = notes.filter(note => {
    if (filters.category && note.category !== filters.category) return false;
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesTitle = note.title.toLowerCase().includes(query);
      const matchesContent = note.content.toLowerCase().includes(query);
      if (!matchesTitle && !matchesContent) return false;
    }
    if (filters.showArchived && !note.isArchived) return false;
    if (!filters.showArchived && note.isArchived) return false;
    if (filters.showPinned && !note.isPinned) return false;
    return true;
  });

  const sortedNotes = filteredNotes.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.updatedAt.getTime() - a.updatedAt.getTime();
  });

  const stats = {
    total: notes.length,
    pinned: notes.filter(n => n.isPinned).length,
    archived: notes.filter(n => n.isArchived).length,
    byCategory: CATEGORIES.reduce((acc, cat) => {
      acc[cat] = notes.filter(n => n.category === cat && !n.isArchived).length;
      return acc;
    }, {} as Record<string, number>),
  };

  const categories = Array.from(new Set(notes.map(n => n.category)));

  return (
    <NotesContext.Provider
      value={{
        notes: sortedNotes,
        filteredNotes: sortedNotes,
        filters,
        addNote,
        updateNote,
        deleteNote,
        togglePin,
        toggleArchive,
        setFilters,
        categories,
        stats,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
}