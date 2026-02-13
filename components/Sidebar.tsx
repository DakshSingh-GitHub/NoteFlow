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
  X
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
    'Personal': 'bg-violet-500',
    'Work': 'bg-blue-500',
    'Ideas': 'bg-cyan-500',
    'Tasks': 'bg-emerald-500',
    'Study': 'bg-amber-500',
    'Health': 'bg-rose-500',
    'Finance': 'bg-green-500',
    'Other': 'bg-slate-500',
  };

  const menuItems = [
    { 
      icon: LayoutDashboard, 
      label: 'All Notes', 
      count: stats.total - stats.archived,
      onClick: () => {
        setFilters({ category: null, showArchived: false, showPinned: false });
        if (isMobile) onMobileMenuClose();
      },
      isActive: !filters.category && !filters.showArchived && !filters.showPinned
    },
    { 
      icon: Pin, 
      label: 'Pinned', 
      count: stats.pinned,
      onClick: () => {
        setFilters({ showPinned: true, showArchived: false });
        if (isMobile) onMobileMenuClose();
      },
      isActive: filters.showPinned
    },
    { 
      icon: Archive, 
      label: 'Archived', 
      count: stats.archived,
      onClick: () => {
        setFilters({ showArchived: true, showPinned: false });
        if (isMobile) onMobileMenuClose();
      },
      isActive: filters.showArchived && !filters.showPinned
    },
  ];

  const handleSettingsClick = () => {
    onSettingsClick();
    if (isMobile) onMobileMenuClose();
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="p-5 border-b border-white/[0.08]">
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="logo-open"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 via-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-purple-500/30 flex-shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-center justify-between flex-1">
                <span className="text-lg font-bold text-white">
                  NoteFlow
                </span>
                {!isMobile && (
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-7 h-7 rounded-lg glass flex items-center justify-center text-white/40 hover:text-white transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="logo-closed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-600 via-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              {!isMobile && (
                <button
                  onClick={() => setIsOpen(true)}
                  className="w-7 h-7 rounded-lg glass flex items-center justify-center text-white/40 hover:text-white transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto overflow-x-hidden">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={item.onClick}
            className={`w-full flex items-center ${isOpen ? 'gap-3 px-3' : 'justify-center px-2'} py-2.5 rounded-xl transition-all duration-200 group relative ${
              item.isActive 
                ? 'bg-purple-500/15 text-purple-300 border border-purple-500/25 backdrop-blur-sm' 
                : 'text-white/60 hover:text-white hover:bg-white/[0.04] border border-transparent'
            }`}
            title={!isOpen ? item.label : undefined}
          >
            <item.icon className={`w-5 h-5 flex-shrink-0 transition-colors ${item.isActive ? 'text-purple-400' : 'text-white/50 group-hover:text-white/70'}`} />
            <AnimatePresence mode="wait">
              {isOpen && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex-1 text-left whitespace-nowrap text-sm font-medium"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
            {isOpen && item.count > 0 && (
              <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                item.isActive ? 'bg-purple-500/30 text-purple-200' : 'bg-white/[0.06] text-white/50'
              }`}>
                {item.count}
              </span>
            )}
            {!isOpen && item.count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-purple-500 rounded-full text-[9px] flex items-center justify-center text-white font-bold border-2 border-[#0a0a0f]">
                {item.count > 9 ? '9+' : item.count}
              </span>
            )}
          </button>
        ))}

        {/* Categories */}
        <div className="pt-6 space-y-1">
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-3 mb-3 text-xs font-semibold text-white/30 uppercase tracking-wider flex items-center gap-2"
              >
                <Tag className="w-3.5 h-3.5" />
                Categories
              </motion.div>
            )}
          </AnimatePresence>
          
          {!isOpen && (
            <div className="flex justify-center mb-3">
              <Tag className="w-4 h-4 text-white/30" />
            </div>
          )}
          
          {CATEGORIES.filter(cat => stats.byCategory[cat] > 0).map((category) => (
            <button
              key={category}
              onClick={() => {
                setFilters({ category, showArchived: false, showPinned: false });
                if (isMobile) onMobileMenuClose();
              }}
              className={`w-full flex items-center ${isOpen ? 'gap-3 px-3' : 'justify-center px-2'} py-2.5 rounded-xl transition-all duration-200 group relative ${
                filters.category === category
                  ? 'bg-purple-500/15 text-purple-300 border border-purple-500/25 backdrop-blur-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.04] border border-transparent'
              }`}
              title={!isOpen ? category : undefined}
            >
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${categoryColors[category] || 'bg-slate-500'}`} />
              <AnimatePresence mode="wait">
                {isOpen && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex-1 text-left whitespace-nowrap text-sm font-medium"
                  >
                    {category}
                  </motion.span>
                )}
              </AnimatePresence>
              {isOpen && stats.byCategory[category] > 0 && (
                <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                  filters.category === category ? 'bg-purple-500/30 text-purple-200' : 'bg-white/[0.06] text-white/50'
                }`}>
                  {stats.byCategory[category]}
                </span>
              )}
              {!isOpen && stats.byCategory[category] > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-white/20 rounded-full text-[9px] flex items-center justify-center text-white font-bold border-2 border-[#0a0a0f]">
                  {stats.byCategory[category] > 9 ? '9+' : stats.byCategory[category]}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/[0.08]">
        <button
          onClick={handleSettingsClick}
          className={`w-full flex items-center ${isOpen ? 'gap-3 px-3' : 'justify-center px-2'} py-2.5 rounded-xl transition-all duration-200 group text-white/60 hover:text-white hover:bg-white/[0.04] border border-transparent`}
          title={!isOpen ? 'Settings' : undefined}
        >
          <Settings className="w-5 h-5 text-white/50 group-hover:text-white/70 flex-shrink-0" />
          <AnimatePresence mode="wait">
            {isOpen && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="text-sm font-medium whitespace-nowrap"
              >
                Settings
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <motion.aside
          initial={false}
          animate={{ width: isOpen ? 260 : 72 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="h-screen sticky top-0 hidden lg:flex flex-col z-20 overflow-hidden bg-[#0a0a0f]/80 backdrop-blur-xl border-r border-white/[0.08]"
        >
          {sidebarContent}
        </motion.aside>
      )}

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobile && isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileMenuClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            
            {/* Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="fixed inset-y-0 left-0 w-[280px] z-50 flex flex-col bg-[#0a0a0f]/95 backdrop-blur-xl border-r border-white/[0.08] lg:hidden"
            >
              {/* Close Button */}
              <button
                onClick={onMobileMenuClose}
                className="absolute top-4 right-4 w-9 h-9 rounded-xl glass flex items-center justify-center text-white/50 hover:text-white transition-all z-10"
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
