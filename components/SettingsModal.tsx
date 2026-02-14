'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Download, 
  Upload, 
  Trash2, 
  LayoutGrid, 
  List,
  Type,
  Keyboard,
  Zap,
  Calendar,
  AlertTriangle,
  FileJson,
  Check,
  Settings2,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useNotes } from '@/context/NotesContext';
import { useInsights } from '@/context/InsightsContext';
import { useState, useEffect } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { notes, stats } = useNotes();
  const { insightsEnabled, setInsightsEnabled } = useInsights();
  const [activeTab, setActiveTab] = useState<'general' | 'data' | 'shortcuts'>('general');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [dateFormat, setDateFormat] = useState<'relative' | 'absolute'>('relative');
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [showToast, setShowToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleExport = () => {
    const data = {
      notes,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `noteflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowToast({ message: 'Notes exported successfully!', type: 'success' });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.notes && Array.isArray(data.notes)) {
          localStorage.setItem('notes', JSON.stringify(data.notes));
          window.location.reload();
        } else {
          setShowToast({ message: 'Invalid file format', type: 'error' });
        }
      } catch {
        setShowToast({ message: 'Failed to import file', type: 'error' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to delete ALL notes? This cannot be undone.')) {
      localStorage.removeItem('notes');
      window.location.reload();
    }
  };

  const handleClearArchived = () => {
    if (confirm('Are you sure you want to delete all archived notes?')) {
      const activeNotes = notes.filter(n => !n.isArchived);
      localStorage.setItem('notes', JSON.stringify(activeNotes));
      window.location.reload();
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings2 },
    { id: 'data', label: 'Data', icon: FileJson },
    { id: 'shortcuts', label: 'Shortcuts', icon: Keyboard },
  ];

  const shortcuts = [
    { key: 'Ctrl + N', action: 'Create new note' },
    { key: 'Ctrl + F', action: 'Focus search' },
    { key: 'Escape', action: 'Close modal' },
    { key: 'Ctrl + S', action: 'Save note' },
  ];

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
            className="w-full max-w-2xl bg-[#0f0f14] rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl max-h-[85vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-violet-600 flex items-center justify-center">
                  <Settings2 className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-white">Settings</h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.08] transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/[0.06]">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all ${
                    activeTab === tab.id 
                      ? 'text-white border-b-2 border-purple-500 bg-purple-500/10' 
                      : 'text-white/40 hover:text-white/60 hover:bg-white/[0.02]'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* General Tab */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  {/* View Mode */}
                  <div className="bg-white/[0.02] rounded-xl p-5 border border-white/[0.06]">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                        <LayoutGrid className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">View Mode</h3>
                        <p className="text-white/40 text-sm">Choose how notes are displayed</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {['grid', 'list'].map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setViewMode(mode as 'grid' | 'list')}
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${
                            viewMode === mode
                              ? 'bg-purple-500/15 border-purple-500/30 text-purple-300'
                              : 'bg-white/[0.03] border-white/[0.06] text-white/50 hover:border-white/[0.1]'
                          }`}
                        >
                          {mode === 'grid' ? <LayoutGrid className="w-4 h-4" /> : <List className="w-4 h-4" />}
                          <span className="capitalize">{mode}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Font Size */}
                  <div className="bg-white/[0.02] rounded-xl p-5 border border-white/[0.06]">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <Type className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">Font Size</h3>
                        <p className="text-white/40 text-sm">Adjust text size for better readability</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {(['small', 'medium', 'large'] as const).map((size) => (
                        <button
                          key={size}
                          onClick={() => setFontSize(size)}
                          className={`flex-1 px-4 py-2.5 rounded-xl border capitalize transition-all ${
                            fontSize === size
                              ? 'bg-blue-500/15 border-blue-500/30 text-blue-300'
                              : 'bg-white/[0.03] border-white/[0.06] text-white/50 hover:border-white/[0.1]'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Animations */}
                  <div className="bg-white/[0.02] rounded-xl p-5 border border-white/[0.06]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                          <Zap className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                          <h3 className="text-white font-medium">Animations</h3>
                          <p className="text-white/40 text-sm">Enable smooth transitions</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setAnimationsEnabled(!animationsEnabled)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${
                          animationsEnabled ? 'bg-purple-600' : 'bg-white/10'
                        }`}
                      >
                        <motion.div
                          animate={{ x: animationsEnabled ? 24 : 4 }}
                          className="absolute top-1 w-4 h-4 rounded-full bg-white"
                        />
                      </button>
                    </div>
                  </div>

                  {/* Smart Insights */}
                  <div className="bg-white/[0.02] rounded-xl p-5 border border-white/[0.06]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center">
                          <Sparkles className="w-5 h-5 text-pink-400" />
                        </div>
                        <div>
                          <h3 className="text-white font-medium">Smart Insights</h3>
                          <p className="text-white/40 text-sm">AI-powered taglines and quotes based on your notes</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setInsightsEnabled(!insightsEnabled)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${
                          insightsEnabled ? 'bg-purple-600' : 'bg-white/10'
                        }`}
                      >
                        <motion.div
                          animate={{ x: insightsEnabled ? 24 : 4 }}
                          className="absolute top-1 w-4 h-4 rounded-full bg-white"
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Data Tab */}
              {activeTab === 'data' && (
                <div className="space-y-6">
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Total', value: stats.total, color: 'text-white' },
                      { label: 'Pinned', value: stats.pinned, color: 'text-purple-400' },
                      { label: 'Archived', value: stats.archived, color: 'text-blue-400' },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.06] text-center">
                        <div className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                        <div className="text-white/40 text-xs">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Export */}
                  <div className="bg-white/[0.02] rounded-xl p-5 border border-white/[0.06]">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                        <Download className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">Export Data</h3>
                        <p className="text-white/40 text-sm">Download all your notes as JSON</p>
                      </div>
                    </div>
                    <button
                      onClick={handleExport}
                      className="w-full px-4 py-2.5 rounded-xl bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Export to JSON
                    </button>
                  </div>

                  {/* Import */}
                  <div className="bg-white/[0.02] rounded-xl p-5 border border-white/[0.06]">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <Upload className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">Import Data</h3>
                        <p className="text-white/40 text-sm">Restore notes from a backup file</p>
                      </div>
                    </div>
                    <label className="w-full px-4 py-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer">
                      <Upload className="w-4 h-4" />
                      Import from JSON
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImport}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Danger Zone */}
                  <div className="bg-red-500/5 rounded-xl p-5 border border-red-500/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">Danger Zone</h3>
                        <p className="text-white/40 text-sm">These actions cannot be undone</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <button
                        onClick={handleClearArchived}
                        disabled={stats.archived === 0}
                        className="w-full px-4 py-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4" />
                        Clear Archived Notes ({stats.archived})
                      </button>
                      <button
                        onClick={handleClearAll}
                        className="w-full px-4 py-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete All Notes
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Shortcuts Tab */}
              {activeTab === 'shortcuts' && (
                <div className="space-y-6">
                  <div className="bg-white/[0.02] rounded-xl p-6 border border-white/[0.06]">
                    <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                      <Keyboard className="w-5 h-5 text-purple-400" />
                      Keyboard Shortcuts
                    </h3>
                    <div className="space-y-3">
                      {shortcuts.map((shortcut, index) => (
                        <div 
                          key={index}
                          className="flex items-center justify-between py-3 border-b border-white/[0.06] last:border-0"
                        >
                          <span className="text-white/60">{shortcut.action}</span>
                          <kbd className="px-3 py-1.5 rounded-lg bg-white/[0.04] text-white text-sm font-mono border border-white/[0.08]">
                            {shortcut.key}
                          </kbd>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white/[0.02] rounded-xl p-6 border border-white/[0.06]">
                    <h3 className="text-white font-medium mb-3">Tips</h3>
                    <ul className="space-y-2 text-white/50 text-sm">
                      {[
                        'Click anywhere on a note card to view it in detail',
                        'Use the pin button to keep important notes at the top',
                        'Archive notes you don\'t need right now but want to keep',
                        'All your notes are automatically saved to your browser',
                      ].map((tip, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Toast */}
          <AnimatePresence>
            {showToast && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg z-50 ${
                  showToast.type === 'success' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-red-600 text-white'
                }`}
              >
                <Check className="w-5 h-5" />
                {showToast.message}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
