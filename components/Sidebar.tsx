'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Pin,
  Archive,
  Tag,
  Settings,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
  Layers3,
  type LucideIcon,
} from 'lucide-react';
import { useNotes } from '@/context/NotesContext';
import { CATEGORIES } from '@/types/note';
import { useState, useEffect } from 'react';

interface SidebarProps {
  onSettingsClick: () => void;
  isMobileMenuOpen: boolean;
  onMobileMenuClose: () => void;
}

export default function Sidebar({ onSettingsClick, isMobileMenuOpen, onMobileMenuClose }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { filters, setFilters, stats } = useNotes();

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setIsOpen(!mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const categoryColors: Record<string, string> = {
    Personal: 'bg-violet-500',
    Work: 'bg-blue-500',
    Ideas: 'bg-cyan-500',
    Tasks: 'bg-emerald-500',
    Study: 'bg-amber-500',
    Health: 'bg-rose-500',
    Finance: 'bg-green-500',
    Other: 'bg-slate-500',
  };

  const visibleCategories = CATEGORIES.filter((cat) => stats.byCategory[cat] > 0);

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: 'All Notes',
      count: stats.total - stats.archived,
      onClick: () => {
        setFilters({ category: null, showArchived: false, showPinned: false });
        if (isMobile) onMobileMenuClose();
      },
      isActive: !filters.category && !filters.showArchived && !filters.showPinned,
    },
    {
      icon: Pin,
      label: 'Pinned',
      count: stats.pinned,
      onClick: () => {
        setFilters({ showPinned: true, showArchived: false, category: null });
        if (isMobile) onMobileMenuClose();
      },
      isActive: filters.showPinned,
    },
    {
      icon: Archive,
      label: 'Archived',
      count: stats.archived,
      onClick: () => {
        setFilters({ showArchived: true, showPinned: false, category: null });
        if (isMobile) onMobileMenuClose();
      },
      isActive: filters.showArchived && !filters.showPinned,
    },
  ];

  const handleSettingsClick = () => {
    onSettingsClick();
    if (isMobile) onMobileMenuClose();
  };

  const sectionLabel = (label: string, Icon?: LucideIcon) =>
    isOpen ? (
      <div className="px-3 mb-2 flex items-center gap-2 text-[11px] font-semibold tracking-[0.12em] uppercase text-white/35">
        {Icon && <Icon className="w-3.5 h-3.5 text-white/35" />}
        <span>{label}</span>
      </div>
    ) : (
      <div className="flex justify-center mb-2">
        {Icon && <Icon className="w-3.5 h-3.5 text-white/25" />}
      </div>
    );

  const renderNavButton = (
    key: string,
    Icon: LucideIcon,
    label: string,
    count: number,
    isActive: boolean,
    onClick: () => void,
    leftDot?: string
  ) => (
    <button
      key={key}
      onClick={onClick}
      title={!isOpen ? label : undefined}
      className={`w-full group relative rounded-xl transition-all duration-200 border ${
        isOpen ? 'px-3.5 py-2.5' : 'px-0 py-2.5'
      } ${
        isActive
          ? 'bg-purple-500/14 border-purple-500/25 text-purple-200'
          : 'bg-transparent border-transparent text-white/65 hover:text-white hover:bg-white/[0.04]'
      }`}
    >
      <div className={`flex items-center ${isOpen ? 'gap-3.5' : 'justify-center'}`}>
        {leftDot ? (
          <span className={`w-2 h-2 rounded-full ${leftDot} flex-shrink-0`} />
        ) : (
          <Icon
            className={`w-[18px] h-[18px] flex-shrink-0 ${
              isActive ? 'text-purple-300' : 'text-white/50 group-hover:text-white/80'
            }`}
          />
        )}

        {isOpen && <span className="flex-1 text-left text-sm font-medium truncate">{label}</span>}

        {isOpen && count > 0 && (
          <span
            className={`min-w-6 h-5 px-1.5 rounded-full text-[11px] font-semibold inline-flex items-center justify-center ${
              isActive ? 'bg-purple-500/28 text-purple-100' : 'bg-white/[0.08] text-white/55'
            }`}
          >
            {count}
          </span>
        )}

        {!isOpen && count > 0 && (
          <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-purple-500 text-[9px] font-bold text-white border-2 border-[#0a0a0f] inline-flex items-center justify-center">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </div>
    </button>
  );

  const sidebarContent = (
    <>
      <div className="px-4 py-4 border-b border-white/[0.08]">
        <div className={`flex items-center ${isOpen ? 'gap-3' : 'flex-col justify-center gap-3'}`}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 via-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-purple-500/20 flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>

          <AnimatePresence mode="wait">
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                className="min-w-0 flex-1"
              >
                <p className="text-white text-lg font-bold leading-tight">NoteFlow</p>
                <p className="text-xs text-white/45 mt-0.5">Capture. Organize. Focus.</p>
              </motion.div>
            )}
          </AnimatePresence>

          {!isMobile && (
            <button
              onClick={() => setIsOpen((prev) => !prev)}
              className="w-8 h-8 rounded-lg border border-white/[0.08] bg-white/[0.03] text-white/45 hover:text-white hover:bg-white/[0.08] transition-all flex-shrink-0"
              title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {isOpen ? (
                <ChevronLeft className="w-4 h-4 mx-auto" />
              ) : (
                <ChevronRight className="w-4 h-4 mx-auto" />
              )}
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 px-3 py-4 space-y-5 overflow-y-auto overflow-x-hidden">
        {isOpen && (
          <div className="rounded-xl border border-white/[0.08] bg-gradient-to-br from-white/[0.05] to-white/[0.02] px-3.5 py-3">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.1em] text-white/35 mb-2">
              <Layers3 className="w-3.5 h-3.5" />
              Quick Stats
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-white/[0.04] px-2.5 py-2 text-center">
                <p className="text-white font-semibold text-sm">{stats.total - stats.archived}</p>
                <p className="text-[10px] text-white/40 mt-0.5">Active</p>
              </div>
              <div className="rounded-lg bg-white/[0.04] px-2.5 py-2 text-center">
                <p className="text-purple-300 font-semibold text-sm">{stats.pinned}</p>
                <p className="text-[10px] text-white/40 mt-0.5">Pinned</p>
              </div>
              <div className="rounded-lg bg-white/[0.04] px-2.5 py-2 text-center">
                <p className="text-blue-300 font-semibold text-sm">{stats.archived}</p>
                <p className="text-[10px] text-white/40 mt-0.5">Archived</p>
              </div>
            </div>
          </div>
        )}

        <div>
          {sectionLabel('Library', LayoutDashboard)}
          <div className="space-y-1.5">
            {menuItems.map((item) =>
              renderNavButton(item.label, item.icon, item.label, item.count, item.isActive, item.onClick)
            )}
          </div>
        </div>

        <div>
          {sectionLabel('Categories', Tag)}
          <div className="space-y-1.5">
            {visibleCategories.length > 0 ? (
              visibleCategories.map((category) =>
                renderNavButton(
                  category,
                  Tag,
                  category,
                  stats.byCategory[category],
                  filters.category === category,
                  () => {
                    setFilters({ category, showArchived: false, showPinned: false });
                    if (isMobile) onMobileMenuClose();
                  },
                  categoryColors[category] || 'bg-slate-500'
                )
              )
            ) : (
              <AnimatePresence mode="wait">
                {isOpen && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-white/35 px-3 py-2"
                  >
                    Categories will appear as you create notes.
                  </motion.p>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      <div className="p-3 border-t border-white/[0.08] bg-[#0a0a0f]/60">
        <button
          onClick={handleSettingsClick}
          title={!isOpen ? 'Settings' : undefined}
          className={`w-full rounded-xl transition-all duration-200 border ${
            isOpen ? 'px-3.5 py-2.5' : 'px-0 py-2.5'
          } border-transparent text-white/65 hover:text-white hover:bg-white/[0.05]`}
        >
          <div className={`flex items-center ${isOpen ? 'gap-3.5' : 'justify-center'}`}>
            <Settings className="w-[18px] h-[18px] text-white/50" />
            {isOpen && <span className="text-sm font-medium">Settings</span>}
          </div>
        </button>
      </div>
    </>
  );

  return (
    <>
      {!isMobile && (
        <motion.aside
          initial={false}
          animate={{ width: isOpen ? 292 : 82 }}
          transition={{ type: 'spring', stiffness: 220, damping: 28, mass: 0.9 }}
          className="h-screen sticky top-0 hidden lg:flex flex-col z-20 overflow-hidden bg-[#0a0a0f]/85 backdrop-blur-xl border-r border-white/[0.08]"
        >
          {sidebarContent}
        </motion.aside>
      )}

      <AnimatePresence>
        {isMobile && isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileMenuClose}
              className="fixed inset-0 bg-black/65 backdrop-blur-sm z-40 lg:hidden"
            />

            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              className="fixed inset-y-0 left-0 w-[300px] max-w-[88vw] z-50 flex flex-col bg-[#0a0a0f]/95 backdrop-blur-xl border-r border-white/[0.08] lg:hidden"
            >
              <button
                onClick={onMobileMenuClose}
                className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-white/60 hover:text-white transition-all z-10"
                title="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
