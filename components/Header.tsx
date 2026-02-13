'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, Menu } from 'lucide-react';
import { useNotes } from '@/context/NotesContext';
import { useNotifications } from '@/context/NotificationContext';
import { useState, useEffect } from 'react';

interface HeaderProps {
  onMenuClick: () => void;
  isMobileMenuOpen: boolean;
  onNotificationClick: () => void;
}

export default function Header({ onMenuClick, isMobileMenuOpen, onNotificationClick }: HeaderProps) {
  const { filters, setFilters, stats } = useNotes();
  const { unreadCount, todayEvents } = useNotifications();
  const [searchValue, setSearchValue] = useState(filters.searchQuery);
  const [greeting, setGreeting] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFilters({ searchQuery: searchValue });
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchValue, setFilters]);

  const getTitle = () => {
    if (filters.showPinned) return 'Pinned Notes';
    if (filters.showArchived) return 'Archived';
    if (filters.category) return filters.category;
    return 'All Notes';
  };

  return (
    <header className="sticky top-0 z-30 px-4 sm:px-6 lg:px-8 pt-10 sm:pt-6 pb-4 sm:pb-6 bg-[#0a0a0f]/70 backdrop-blur-xl border-b border-white/[0.08]">
      <div className="flex items-center justify-between gap-4">
        {/* Left Section */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Mobile Menu Button */}
          <AnimatePresence>
            {isMobile && !isMobileMenuOpen && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileTap={{ scale: 0.95 }}
                onClick={onMenuClick}
                className="flex-shrink-0 w-10 h-10 rounded-xl glass flex items-center justify-center text-white/70 hover:text-white transition-all touch-target"
              >
                <Menu className="w-5 h-5" />
              </motion.button>
            )}
          </AnimatePresence>
          
          {/* Title Section */}
          <div className="min-w-0">
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl sm:text-2xl font-bold text-white mb-0.5 truncate"
            >
              {getTitle()}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-white/40 text-sm truncate"
            >
              {greeting} • {stats.total - stats.archived} notes
              {todayEvents.length > 0 && (
                <span className="ml-2 text-purple-400">
                  • {todayEvents.length} event{todayEvents.length > 1 ? 's' : ''} today
                </span>
              )}
            </motion.p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <AnimatePresence mode="wait">
            {isMobile && isSearchOpen ? (
              <motion.div
                key="mobile-search"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="flex items-center gap-2"
              >
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    autoFocus
                    className="w-44 pl-10 pr-3 py-2.5 rounded-xl glass text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.06] transition-all"
                  />
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchValue('');
                    setFilters({ searchQuery: '' });
                  }}
                  className="w-10 h-10 rounded-xl glass flex items-center justify-center text-white/60 hover:text-white transition-all touch-target"
                >
                  <span className="text-sm font-medium">Cancel</span>
                </motion.button>
              </motion.div>
            ) : (
              <>
                {/* Desktop Search */}
                {!isMobile && (
                  <motion.div 
                    key="desktop-search"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative"
                  >
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="text"
                      placeholder="Search notes..."
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      className="w-56 lg:w-72 pl-11 pr-4 py-3 rounded-xl glass text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-purple-500/10 transition-all"
                    />
                  </motion.div>
                )}

                {/* Mobile Search Toggle */}
                {isMobile && (
                  <motion.button
                    key="search-toggle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsSearchOpen(true)}
                    className="w-10 h-10 rounded-xl glass flex items-center justify-center text-white/60 hover:text-white transition-all touch-target"
                  >
                    <Search className="w-5 h-5" />
                  </motion.button>
                )}
              </>
            )}
          </AnimatePresence>

          {/* Notification Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onNotificationClick}
            className="relative w-10 h-10 rounded-xl glass flex items-center justify-center text-white/60 hover:text-white transition-all touch-target"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold border-2 border-[#0a0a0f]">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
            {unreadCount === 0 && todayEvents.length > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            )}
          </motion.button>
        </div>
      </div>
    </header>
  );
}
