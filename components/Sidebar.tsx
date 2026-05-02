'use client';

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
} from 'lucide-react';
import { useNotes } from '@/context/NotesContext';
import { CATEGORIES } from '@/types/note';
import { useState, useEffect, useRef } from 'react';
import { animate, remove } from 'animejs';

type LucideIcon = any;

interface SidebarProps {
  onSettingsClick: () => void;
  isMobileMenuOpen: boolean;
  onMobileMenuClose: () => void;
}

export default function Sidebar({ onSettingsClick, isMobileMenuOpen, onMobileMenuClose }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);
  const { filters, setFilters, stats } = useNotes();
  const desktopSidebarRef = useRef<HTMLElement | null>(null);
  const mobileBackdropRef = useRef<HTMLDivElement | null>(null);
  const mobileDrawerRef = useRef<HTMLElement | null>(null);
  const hasMountedRef = useRef(false);

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

  useEffect(() => {
    if (isMobile || !desktopSidebarRef.current) return;

    if (!hasMountedRef.current) {
      desktopSidebarRef.current.style.width = `${isOpen ? 292 : 92}px`;
      hasMountedRef.current = true;
      return;
    }

    remove(desktopSidebarRef.current);
    animate(desktopSidebarRef.current, {
      width: `${isOpen ? 292 : 92}px`,
      duration: 520,
      easing: 'easeInOutQuart',
    });
  }, [isOpen, isMobile]);

  useEffect(() => {
    if (!isMobile) {
      setShowMobileDrawer(false);
      return;
    }

    if (isMobileMenuOpen) {
      setShowMobileDrawer(true);
      return;
    }

    if (!showMobileDrawer) return;

    if (mobileBackdropRef.current) {
      remove(mobileBackdropRef.current);
      animate(mobileBackdropRef.current, {
        opacity: [1, 0],
        duration: 220,
        easing: 'easeOutQuad',
      });
    }

    if (mobileDrawerRef.current) {
      remove(mobileDrawerRef.current);
      animate(mobileDrawerRef.current, {
        translateX: ['0%', '-100%'],
        duration: 280,
        easing: 'easeInCubic',
        complete: () => setShowMobileDrawer(false),
      });
    } else {
      setShowMobileDrawer(false);
    }
  }, [isMobileMenuOpen, isMobile, showMobileDrawer]);

  useEffect(() => {
    if (!showMobileDrawer || !isMobileMenuOpen) return;

    if (mobileBackdropRef.current) {
      mobileBackdropRef.current.style.opacity = '0';
      remove(mobileBackdropRef.current);
      animate(mobileBackdropRef.current, {
        opacity: [0, 1],
        duration: 220,
        easing: 'easeOutQuad',
      });
    }

    if (mobileDrawerRef.current) {
      mobileDrawerRef.current.style.transform = 'translateX(-100%)';
      remove(mobileDrawerRef.current);
      animate(mobileDrawerRef.current, {
        translateX: ['-100%', '0%'],
        duration: 340,
        easing: 'easeOutCubic',
      });
    }
  }, [showMobileDrawer, isMobileMenuOpen]);

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
  const isExpanded = isMobile || isOpen;

  const sectionLabel = (label: string, Icon?: LucideIcon) =>
    isExpanded ? (
      <div className="px-3 mb-2 flex items-center gap-2 text-[11px] font-semibold tracking-[0.12em] uppercase text-white/35">
        {Icon && <Icon className="w-3.5 h-3.5 text-white/35" />}
        <span>{label}</span>
      </div>
    ) : (
      <div className="flex justify-center mb-3 mt-1">
        {Icon && <Icon className="w-3.5 h-3.5 text-white/30" />}
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
      title={!isExpanded ? label : undefined}
      className={`w-full group relative transition-all duration-200 border ${
        isExpanded ? 'rounded-xl px-3.5 py-2.5' : 'rounded-2xl px-2 py-1.5'
      } ${
        isActive
          ? 'bg-purple-500/14 border-purple-500/25 text-purple-200'
          : 'bg-transparent border-transparent text-white/65 hover:text-white hover:bg-white/[0.04]'
      }`}
    >
      <div
        className={`flex items-center ${
          isExpanded ? 'gap-3.5' : 'justify-center mx-auto w-11 h-11 rounded-xl border border-white/[0.08] bg-white/[0.02]'
        }`}
      >
        {leftDot ? (
          <span className={`w-2.5 h-2.5 rounded-full ${leftDot} flex-shrink-0`} />
        ) : (
          <Icon
            className={`w-[18px] h-[18px] flex-shrink-0 ${
              isActive ? 'text-purple-300' : 'text-white/60 group-hover:text-white/90'
            }`}
          />
        )}

        {isExpanded && <span className="flex-1 text-left text-sm font-medium truncate">{label}</span>}

        {isExpanded && count > 0 && (
          <span
            className={`min-w-6 h-5 px-1.5 rounded-full text-[11px] font-semibold inline-flex items-center justify-center ${
              isActive ? 'bg-purple-500/28 text-purple-100' : 'bg-white/[0.08] text-white/55'
            }`}
          >
            {count}
          </span>
        )}

        {!isExpanded && count > 0 && (
          <span className="absolute top-0.5 right-0.5 z-20 min-w-[20px] h-5 px-1 rounded-full bg-fuchsia-500 text-[10px] font-extrabold text-white border-2 border-[#0b0b11] inline-flex items-center justify-center shadow-lg shadow-fuchsia-500/60">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </div>
    </button>
  );

  const sidebarContent = (
    <>
      <div className={`px-4 border-b border-white/[0.08] ${isExpanded ? 'py-4' : 'py-5'}`}>
        <div className={`flex items-center ${isExpanded ? 'gap-3' : 'flex-col justify-center gap-2.5'}`}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 via-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-purple-500/20 flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>

          {isExpanded && (
            <div className="min-w-0 flex-1">
              <p className="text-white text-lg font-bold leading-tight">NoteFlow</p>
              <p className="text-xs text-white/45 mt-0.5">Capture. Organize. Focus.</p>
            </div>
          )}

          {!isMobile && (
            <button
              onClick={() => setIsOpen((prev) => !prev)}
              className="w-8 h-8 rounded-lg border border-white/[0.1] bg-white/[0.05] text-white/55 hover:text-white hover:bg-white/[0.1] transition-all flex-shrink-0"
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

      <div className={`flex-1 min-h-0 px-3 py-4 overflow-y-auto overflow-x-hidden ${isExpanded ? 'space-y-5' : 'space-y-6'}`}>
        {isExpanded && (
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
              isExpanded && (
                <p className="text-xs text-white/35 px-3 py-2">
                  Categories will appear as you create notes.
                </p>
              )
            )}
          </div>
        </div>
      </div>

      <div className={`p-3 border-t border-white/[0.08] bg-[#0a0a0f]/60 ${isExpanded ? '' : 'pb-4'} ${isMobile ? 'safe-area-inset-bottom' : ''}`}>
        <button
          onClick={handleSettingsClick}
          title={!isExpanded ? 'Settings' : undefined}
          className={`w-full rounded-xl transition-all duration-200 border ${
            isExpanded ? 'px-3.5 py-2.5' : 'px-2 py-1.5'
          } border-transparent text-white/65 hover:text-white hover:bg-white/[0.05]`}
        >
          <div
            className={`flex items-center ${
              isExpanded ? 'gap-3.5' : 'justify-center mx-auto w-11 h-11 rounded-xl border border-white/[0.08] bg-white/[0.02]'
            }`}
          >
            <Settings className="w-[18px] h-[18px] text-white/50" />
            {isExpanded && <span className="text-sm font-medium">Settings</span>}
          </div>
        </button>
      </div>
    </>
  );

  return (
    <>
      {!isMobile && (
        <aside
          ref={desktopSidebarRef}
          style={{ width: '292px' }}
          className="h-screen sticky top-0 hidden lg:flex flex-col z-20 overflow-hidden bg-[#0a0a0f]/85 backdrop-blur-xl border-r border-white/[0.08]"
        >
          {sidebarContent}
        </aside>
      )}

      {isMobile && showMobileDrawer && (
        <>
          <div
            ref={mobileBackdropRef}
            onClick={onMobileMenuClose}
            className="fixed inset-0 bg-black/65 backdrop-blur-sm z-40 lg:hidden"
          />

          <aside
            ref={mobileDrawerRef}
            className="fixed inset-y-0 left-0 w-[92vw] max-w-[360px] z-50 flex flex-col bg-[#0a0a0f]/95 backdrop-blur-xl border-r border-white/[0.08] lg:hidden safe-area-inset-top"
          >
            <button
              onClick={onMobileMenuClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-white/60 hover:text-white transition-all z-10"
              title="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
