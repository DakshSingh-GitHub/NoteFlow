'use client';

import { motion } from 'framer-motion';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import NoteGrid from '@/components/NoteGrid';
import FloatingActionButton from '@/components/FloatingActionButton';
import NoteModal from '@/components/NoteModal';
import NoteViewModal from '@/components/NoteViewModal';
import SettingsModal from '@/components/SettingsModal';
import NotificationModal from '@/components/NotificationModal';
import { useState } from 'react';
import { Note } from '@/types/note';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const handleEdit = (noteId: string) => {
    setEditingNote(noteId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingNote(null);
  };

  const handleView = (note: Note) => {
    setViewingNote(note);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewingNote(null);
  };

  return (
    <div className="min-h-screen flex bg-[#0a0a0f]">
      <Sidebar 
        onSettingsClick={() => setIsSettingsOpen(true)} 
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuClose={() => setIsMobileMenuOpen(false)}
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          onMenuClick={() => setIsMobileMenuOpen(true)}
          isMobileMenuOpen={isMobileMenuOpen}
          onNotificationClick={() => setIsNotificationOpen(true)}
        />
        
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <NoteGrid onEdit={handleEdit} onView={handleView} />
          </motion.div>
        </main>

        <FloatingActionButton onClick={() => setIsModalOpen(true)} />
      </div>

      <NoteModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        editingNoteId={editingNote}
      />

      <NoteViewModal
        note={viewingNote}
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        onEdit={handleEdit}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <NotificationModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />
    </div>
  );
}
