'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Bell, 
  Calendar, 
  Clock, 
  Check,
  Trash2,
  AlertCircle,
  CalendarDays,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { useNotes } from '@/context/NotesContext';
import { useEffect } from 'react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationModal({ isOpen, onClose }: NotificationModalProps) {
  const { 
    notifications, 
    unreadCount, 
    todayEvents, 
    upcomingEvents,
    markAsRead, 
    markAllAsRead,
    deleteNotification,
    scanNotesForEvents 
  } = useNotifications();
  const { notes } = useNotes();

  // Scan for events when modal opens
  useEffect(() => {
    if (isOpen) {
      scanNotesForEvents(notes);
    }
  }, [isOpen, notes, scanNotesForEvents]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const formatDate = (date: Date) => {
    const now = new Date();
    const eventDate = new Date(date);
    eventDate.setHours(0, 0, 0, 0);
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (eventDate.getTime() === today.getTime()) {
      return 'Today';
    } else if (eventDate.getTime() === tomorrow.getTime()) {
      return 'Tomorrow';
    } else {
      return eventDate.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'deadline':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'event':
        return <Calendar className="w-4 h-4 text-purple-400" />;
      case 'reminder':
        return <Bell className="w-4 h-4 text-yellow-400" />;
      case 'time':
        return <Clock className="w-4 h-4 text-cyan-400" />;
      default:
        return <CalendarDays className="w-4 h-4 text-blue-400" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'deadline':
        return 'bg-red-500/10 border-red-500/20 text-red-400';
      case 'event':
        return 'bg-purple-500/10 border-purple-500/20 text-purple-400';
      case 'reminder':
        return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400';
      case 'time':
        return 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400';
      default:
        return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
    }
  };

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
            className="w-full max-w-lg bg-[#0f0f14] rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl max-h-[85vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-violet-600 flex items-center justify-center relative">
                  <Bell className="w-5 h-5 text-white" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Notifications</h2>
                  <p className="text-white/40 text-sm">
                    {notifications.length} event{notifications.length !== 1 ? 's' : ''} detected
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-purple-400 hover:bg-purple-500/10 transition-all"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg glass flex items-center justify-center text-white/50 hover:text-white transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Today's Events */}
              {todayEvents.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">
                      Today
                    </h3>
                    <span className="text-xs text-white/30">({todayEvents.length})</span>
                  </div>
                  <div className="space-y-2">
                    {todayEvents.map((event) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 rounded-xl border transition-all cursor-pointer ${
                          event.isRead 
                            ? 'bg-white/[0.02] border-white/[0.06] opacity-60' 
                            : 'bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.06]'
                        }`}
                        onClick={() => markAsRead(event.id)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getEventColor(event.eventType)}`}>
                              {getEventIcon(event.eventType)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-sm font-medium text-white truncate">
                                  {event.noteTitle}
                                </h4>
                                {!event.isRead && (
                                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                                )}
                              </div>
                              <p className="text-white/50 text-xs line-clamp-2 mb-2">
                                {event.description}
                              </p>
                              <div className="flex items-center gap-2">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${getEventColor(event.eventType)}`}>
                                  {getEventIcon(event.eventType)}
                                  <span className="capitalize">{event.eventType}</span>
                                </span>
                                <span className="text-white/30 text-xs">
                                  {formatTime(event.eventDate)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(event.id);
                            }}
                            className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}

              {/* Upcoming Events */}
              {upcomingEvents.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-purple-400" />
                    <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">
                      Upcoming
                    </h3>
                    <span className="text-xs text-white/30">({upcomingEvents.length})</span>
                  </div>
                  <div className="space-y-2">
                    {upcomingEvents.slice(0, 10).map((event) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 rounded-xl border transition-all cursor-pointer ${
                          event.isRead 
                            ? 'bg-white/[0.02] border-white/[0.06] opacity-60' 
                            : 'bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.06]'
                        }`}
                        onClick={() => markAsRead(event.id)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getEventColor(event.eventType)}`}>
                              {getEventIcon(event.eventType)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-sm font-medium text-white truncate">
                                  {event.noteTitle}
                                </h4>
                                {!event.isRead && (
                                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                                )}
                              </div>
                              <p className="text-white/50 text-xs line-clamp-2 mb-2">
                                {event.description}
                              </p>
                              <div className="flex items-center gap-2">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${getEventColor(event.eventType)}`}>
                                  {getEventIcon(event.eventType)}
                                  <span className="capitalize">{event.eventType}</span>
                                </span>
                                <span className="text-white/30 text-xs">
                                  {formatDate(event.eventDate)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(event.id);
                            }}
                            className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}

              {/* Empty State */}
              {notifications.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-20 h-20 rounded-2xl glass flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-white/20" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">No events detected</h3>
                  <p className="text-white/40 text-sm max-w-xs">
                    Add dates to your notes like &quot;Meeting tomorrow at 3pm&quot; or &quot;Deadline: Jan 15&quot; and they&apos;ll appear here
                  </p>
                </div>
              )}

              {/* Tips */}
              {notifications.length > 0 && (
                <div className="glass rounded-xl p-4">
                  <h4 className="text-sm font-medium text-white/70 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    Tips for better detection
                  </h4>
                  <ul className="space-y-1.5 text-white/40 text-xs">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-3 h-3 text-purple-400 mt-0.5 flex-shrink-0" />
                      Use phrases like &quot;today&quot;, &quot;tomorrow&quot;, or &quot;next Monday&quot;
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-3 h-3 text-purple-400 mt-0.5 flex-shrink-0" />
                      Write dates as &quot;Jan 15&quot; or &quot;15 January&quot;
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-3 h-3 text-purple-400 mt-0.5 flex-shrink-0" />
                      Mention &quot;deadline&quot;, &quot;meeting&quot;, or &quot;reminder&quot; for better categorization
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
