'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Note, NoteEvent } from '@/types/note';

interface NotificationContextType {
  notifications: NoteEvent[];
  unreadCount: number;
  todayEvents: NoteEvent[];
  upcomingEvents: NoteEvent[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  scanNotesForEvents: (notes: Note[]) => void;
  deleteNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Date detection patterns
const datePatterns = {
  // Today, Tomorrow, Yesterday
  relativeDays: /\b(today|tomorrow|yesterday)\b/gi,
  
  // Days of week
  daysOfWeek: /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi,
  
  // Date formats: Jan 15, January 15, 15 Jan, 15 January
  dateFormats: /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)[\.\s]+(\d{1,2})(?:st|nd|rd|th)?(?:[,\s]+(\d{4})|\b)/gi,
  
  // Numeric dates: 01/15/2024, 15-01-2024, 2024-01-15
  numericDates: /\b(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})\b/g,
  
  // ISO dates: 2024-01-15
  isoDates: /\b(\d{4})-(\d{2})-(\d{2})\b/g,
  
  // Time formats
  timeFormats: /\b(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?\b/gi,
  
  // Keywords indicating events/deadlines
  eventKeywords: /\b(meeting|deadline|due|appointment|schedule|event|reminder|task|todo|call|conference|interview|deadline|submit|complete|finish|launch|release)\b/gi,
  
  // In X days/weeks/months
  inXTime: /\bin\s+(\d+)\s+(day|days|week|weeks|month|months|year|years)\b/gi,
  
  // Next week/month/year
  nextTime: /\bnext\s+(week|month|year|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi,
};

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NoteEvent[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load notifications from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('notifications');
    if (saved) {
      const parsed = JSON.parse(saved);
      setNotifications(parsed.map((n: NoteEvent) => ({
        ...n,
        eventDate: new Date(n.eventDate),
        createdAt: new Date(n.createdAt),
      })));
    }
    setIsLoaded(true);
  }, []);

  // Save notifications to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('notifications', JSON.stringify(notifications));
    }
  }, [notifications, isLoaded]);

  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayEvents = notifications.filter(n => {
    const eventDate = new Date(n.eventDate);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate.getTime() === today.getTime();
  }).sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime());

  const upcomingEvents = notifications.filter(n => {
    const eventDate = new Date(n.eventDate);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate.getTime() > today.getTime();
  }).sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime());

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true }))
    );
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const parseDateFromText = (text: string): Date | null => {
    const now = new Date();
    const lowerText = text.toLowerCase();
    
    // Check for "today"
    if (lowerText.includes('today')) {
      return now;
    }
    
    // Check for "tomorrow"
    if (lowerText.includes('tomorrow')) {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }
    
    // Check for "yesterday"
    if (lowerText.includes('yesterday')) {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday;
    }
    
    // Check for days of week
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    for (let i = 0; i < daysOfWeek.length; i++) {
      if (lowerText.includes(daysOfWeek[i])) {
        const targetDate = new Date(now);
        const currentDay = now.getDay();
        const daysUntilTarget = (i - currentDay + 7) % 7;
        if (daysUntilTarget === 0) {
          targetDate.setDate(targetDate.getDate() + 7); // Next week
        } else {
          targetDate.setDate(targetDate.getDate() + daysUntilTarget);
        }
        return targetDate;
      }
    }
    
    // Check for "next week"
    if (lowerText.includes('next week')) {
      const nextWeek = new Date(now);
      nextWeek.setDate(nextWeek.getDate() + 7);
      return nextWeek;
    }
    
    // Check for "in X days/weeks/months"
    const inXTimeMatch = text.match(/in\s+(\d+)\s+(day|days|week|weeks|month|months)/i);
    if (inXTimeMatch) {
      const amount = parseInt(inXTimeMatch[1]);
      const unit = inXTimeMatch[2].toLowerCase();
      const date = new Date(now);
      
      if (unit.startsWith('day')) {
        date.setDate(date.getDate() + amount);
      } else if (unit.startsWith('week')) {
        date.setDate(date.getDate() + amount * 7);
      } else if (unit.startsWith('month')) {
        date.setMonth(date.getMonth() + amount);
      }
      return date;
    }
    
    // Try to parse date formats
    const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 
                       'july', 'august', 'september', 'october', 'november', 'december'];
    const monthAbbr = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 
                      'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    
    // Match patterns like "Jan 15", "January 15", "15 Jan", "15 January"
    const monthPattern = new RegExp(
      `(\\d{1,2})?\\s*(?:${monthNames.join('|')}|${monthAbbr.join('|')})[\\.\\s]+(\\d{1,2})(?:st|nd|rd|th)?(?:[,\\s]+(\\d{4}))?`,
      'gi'
    );
    
    const monthMatch = monthPattern.exec(text);
    if (monthMatch) {
      const date = new Date(now);
      const monthText = monthMatch[0].toLowerCase();
      let monthIndex = -1;
      
      for (let i = 0; i < 12; i++) {
        if (monthText.includes(monthNames[i]) || monthText.includes(monthAbbr[i])) {
          monthIndex = i;
          break;
        }
      }
      
      if (monthIndex !== -1) {
        // Extract day from the match
        const dayMatch = monthMatch[0].match(/(\d{1,2})/);
        if (dayMatch) {
          date.setMonth(monthIndex);
          date.setDate(parseInt(dayMatch[1]));
          return date;
        }
      }
    }
    
    // Try ISO date format
    const isoMatch = text.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
    if (isoMatch) {
      return new Date(parseInt(isoMatch[1]), parseInt(isoMatch[2]) - 1, parseInt(isoMatch[3]));
    }
    
    return null;
  };

  const getEventType = (text: string): 'date' | 'time' | 'deadline' | 'event' | 'reminder' => {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('deadline') || lowerText.includes('due')) {
      return 'deadline';
    }
    if (lowerText.includes('meeting') || lowerText.includes('appointment') || lowerText.includes('call') || lowerText.includes('conference') || lowerText.includes('interview')) {
      return 'event';
    }
    if (lowerText.includes('reminder') || lowerText.includes('remember')) {
      return 'reminder';
    }
    if (lowerText.match(/\d{1,2}:\d{2}/)) {
      return 'time';
    }
    return 'date';
  };

  const extractEventDescription = (note: Note, text: string): string => {
    // Get the sentence containing the date/time reference
    const sentences = note.content.split(/[.!?]+/);
    for (const sentence of sentences) {
      if (sentence.toLowerCase().includes(text.toLowerCase())) {
        return sentence.trim();
      }
    }
    return note.content.substring(0, 100) + (note.content.length > 100 ? '...' : '');
  };

  const scanNotesForEvents = useCallback((notes: Note[]) => {
    const newEvents: NoteEvent[] = [];
    const existingEventIds = new Set(notifications.map(n => `${n.noteId}-${n.eventDate.toISOString()}`));
    
    notes.forEach(note => {
      if (note.isArchived) return;
      
      const textToScan = `${note.title} ${note.content}`;
      const lines = textToScan.split(/\n/);
      
      lines.forEach(line => {
        // Check for date patterns
        const date = parseDateFromText(line);
        if (date) {
          const eventType = getEventType(line);
          const description = extractEventDescription(note, line);
          const eventId = `${note.id}-${date.toISOString()}`;
          
          if (!existingEventIds.has(eventId)) {
            newEvents.push({
              id: eventId,
              noteId: note.id,
              noteTitle: note.title,
              eventType,
              eventDate: date,
              description,
              isRead: false,
              createdAt: new Date(),
            });
            existingEventIds.add(eventId);
          }
        }
      });
    });
    
    if (newEvents.length > 0) {
      setNotifications(prev => [...newEvents, ...prev]);
    }
  }, [notifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        todayEvents,
        upcomingEvents,
        markAsRead,
        markAllAsRead,
        scanNotesForEvents,
        deleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
