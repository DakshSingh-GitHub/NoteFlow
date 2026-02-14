'use client';

import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { useNotes } from './NotesContext';
import { generateInsight, NoteInsight, getQuickStats } from '@/lib/insights';

interface InsightsContextType {
  insightsEnabled: boolean;
  setInsightsEnabled: (enabled: boolean) => void;
  currentInsight: NoteInsight | null;
  quickStats: { label: string; value: string }[];
}

const InsightsContext = createContext<InsightsContextType | undefined>(undefined);

export function InsightsProvider({ children }: { children: ReactNode }) {
  const { notes } = useNotes();
  const [insightsEnabled, setInsightsEnabled] = useState(true);
  const [currentInsight, setCurrentInsight] = useState<NoteInsight | null>(null);
  const [quickStats, setQuickStats] = useState<{ label: string; value: string }[]>([]);

  // Load preference from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('insights-enabled');
    if (saved !== null) {
      setInsightsEnabled(saved === 'true');
    }
  }, []);

  // Save preference when changed
  useEffect(() => {
    localStorage.setItem('insights-enabled', insightsEnabled.toString());
  }, [insightsEnabled]);

  // Generate or load insight
  useEffect(() => {
    if (insightsEnabled && notes.length > 0) {
      // Check sessionStorage first
      const savedInsight = sessionStorage.getItem('noteflow-insight');
      const savedStats = sessionStorage.getItem('noteflow-insight-stats');
      
      if (savedInsight) {
        setCurrentInsight(JSON.parse(savedInsight));
      } else {
        const insight = generateInsight(notes);
        setCurrentInsight(insight);
        sessionStorage.setItem('noteflow-insight', JSON.stringify(insight));
      }
      
      if (savedStats) {
        setQuickStats(JSON.parse(savedStats));
      } else {
        const stats = getQuickStats(notes);
        setQuickStats(stats);
        sessionStorage.setItem('noteflow-insight-stats', JSON.stringify(stats));
      }
    } else {
      setCurrentInsight(null);
      setQuickStats([]);
    }
  }, [notes, insightsEnabled]);

  return (
    <InsightsContext.Provider
      value={{
        insightsEnabled,
        setInsightsEnabled,
        currentInsight,
        quickStats,
      }}
    >
      {children}
    </InsightsContext.Provider>
  );
}

export function useInsights() {
  const context = useContext(InsightsContext);
  if (context === undefined) {
    throw new Error('useInsights must be used within an InsightsProvider');
  }
  return context;
}
