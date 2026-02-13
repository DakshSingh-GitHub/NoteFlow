export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
  isPinned: boolean;
  isArchived: boolean;
}

export type NoteCategory = 
  | 'Personal'
  | 'Work'
  | 'Ideas'
  | 'Tasks'
  | 'Study'
  | 'Health'
  | 'Finance'
  | 'Other';

export const CATEGORIES: NoteCategory[] = [
  'Personal',
  'Work',
  'Ideas',
  'Tasks',
  'Study',
  'Health',
  'Finance',
  'Other',
];

export const NOTE_COLORS = [
  { name: 'Purple', value: 'from-purple-600 to-fuchsia-600', border: 'border-purple-500', icon: 'text-purple-400', bg: 'bg-purple-600' },
  { name: 'Blue', value: 'from-blue-600 to-cyan-500', border: 'border-blue-500', icon: 'text-blue-400', bg: 'bg-blue-600' },
  { name: 'Green', value: 'from-emerald-600 to-teal-500', border: 'border-emerald-500', icon: 'text-emerald-400', bg: 'bg-emerald-600' },
  { name: 'Orange', value: 'from-orange-600 to-amber-500', border: 'border-orange-500', icon: 'text-orange-400', bg: 'bg-orange-600' },
  { name: 'Red', value: 'from-rose-600 to-red-600', border: 'border-rose-500', icon: 'text-rose-400', bg: 'bg-rose-600' },
  { name: 'Pink', value: 'from-pink-600 to-rose-500', border: 'border-pink-500', icon: 'text-pink-400', bg: 'bg-pink-600' },
  { name: 'Yellow', value: 'from-yellow-500 to-amber-600', border: 'border-yellow-500', icon: 'text-yellow-400', bg: 'bg-yellow-500' },
  { name: 'Indigo', value: 'from-indigo-600 to-purple-700', border: 'border-indigo-500', icon: 'text-indigo-400', bg: 'bg-indigo-600' },
  { name: 'Cyan', value: 'from-cyan-600 to-sky-500', border: 'border-cyan-500', icon: 'text-cyan-400', bg: 'bg-cyan-600' },
  { name: 'Lime', value: 'from-lime-500 to-green-600', border: 'border-lime-500', icon: 'text-lime-400', bg: 'bg-lime-500' },
  { name: 'Violet', value: 'from-violet-600 to-purple-600', border: 'border-violet-500', icon: 'text-violet-400', bg: 'bg-violet-600' },
  { name: 'Fuchsia', value: 'from-fuchsia-600 to-pink-600', border: 'border-fuchsia-500', icon: 'text-fuchsia-400', bg: 'bg-fuchsia-600' },
  { name: 'Sky', value: 'from-sky-500 to-blue-500', border: 'border-sky-500', icon: 'text-sky-400', bg: 'bg-sky-500' },
  { name: 'Teal', value: 'from-teal-600 to-emerald-600', border: 'border-teal-500', icon: 'text-teal-400', bg: 'bg-teal-600' },
  { name: 'Amber', value: 'from-amber-500 to-orange-600', border: 'border-amber-500', icon: 'text-amber-400', bg: 'bg-amber-500' },
  { name: 'Slate', value: 'from-slate-600 to-gray-600', border: 'border-slate-500', icon: 'text-slate-400', bg: 'bg-slate-600' },
];

export interface FilterState {
  category: string | null;
  searchQuery: string;
  showArchived: boolean;
  showPinned: boolean;
}

export interface DetectedEvent {
  type: 'date' | 'time' | 'deadline' | 'event' | 'reminder';
  value: string;
  parsedDate?: Date;
  originalText: string;
}

export interface NoteEvent {
  id: string;
  noteId: string;
  noteTitle: string;
  eventType: 'date' | 'time' | 'deadline' | 'event' | 'reminder';
  eventDate: Date;
  description: string;
  isRead: boolean;
  createdAt: Date;
}
