
import React, { useState, useRef, useEffect } from 'react';
import InviteModal from './InviteModal';
import AiAssistant from './AiAssistant';
import { Task } from '../types';
import { api } from '../services/api';
import { UserButton } from "@clerk/clerk-react";

export type ViewType = 'board' | 'list' | 'timeline' | 'reports' | 'my-tasks' | 'docs' | 'trash';

interface LayoutProps {
  children: React.ReactNode;
  onNewTask: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  colorTheme: string;
  setColorTheme: (theme: string) => void;
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onExportCSV: () => void;
  onGenerateSprint: () => void;
  onOpenAutomations: () => void;
  onOpenShortcuts: () => void;
  tasks: Task[];
  zenMode: boolean;
  toggleZenMode: () => void;
}

const QUOTES = [
  "The secret of getting ahead is getting started.",
  "It always seems impossible until it's done.",
  "Don't watch the clock; do what it does. Keep going.",
  "The future depends on what you do today.",
  "Focus on being productive instead of busy."
];

const Layout: React.FC<LayoutProps> = ({
  children,
  onNewTask,
  darkMode,
  toggleDarkMode,
  colorTheme,
  setColorTheme,
  currentView,
  onViewChange,
  searchQuery,
  onSearchChange,
  onExportCSV,
  onGenerateSprint,
  onOpenAutomations,
  onOpenShortcuts,
  tasks,
  zenMode,
  toggleZenMode
}) => {
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);
  const [quote, setQuote] = useState("");

  // Pomodoro State
  const [pomoTime, setPomoTime] = useState(25 * 60);
  const [isPomoRunning, setIsPomoRunning] = useState(false);
  const [pomoMode, setPomoMode] = useState<'work' | 'break'>('work');

  // Sticky Note State
  const [stickyNote, setStickyNote] = useState('');
  const [userStatus, setUserStatus] = useState<'online' | 'focus' | 'away'>('online');

  useEffect(() => {
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    loadStickyNote();
  }, []);

  const loadStickyNote = async () => {
    try {
      const note = await api.getStickyNote();
      setStickyNote(note.content || '');
    } catch (e) {
      console.error("Failed to load sticky note", e);
    }
  };

  // Sticky Note Persistence (Debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      api.updateStickyNote({ content: stickyNote }).catch(e => console.error("Failed to save sticky note", e));
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [stickyNote]);

  // Pomodoro Timer Effect
  useEffect(() => {
    let interval: any;
    if (isPomoRunning && pomoTime > 0) {
      interval = setInterval(() => setPomoTime(t => t - 1), 1000);
    } else if (pomoTime === 0) {
      setIsPomoRunning(false);
      // Play sound or notify
      alert(pomoMode === 'work' ? 'Work session done! Take a break.' : 'Break over! Back to work.');
      setPomoMode(prev => prev === 'work' ? 'break' : 'work');
      setPomoTime(pomoMode === 'work' ? 5 * 60 : 25 * 60);
    }
    return () => clearInterval(interval);
  }, [isPomoRunning, pomoTime, pomoMode]);

  const togglePomo = () => setIsPomoRunning(!isPomoRunning);
  const resetPomo = () => {
    setIsPomoRunning(false);
    setPomoTime(25 * 60);
    setPomoMode('work');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const themes = [
    { id: 'blue', name: 'Ocean', color: '#3b82f6' },
    { id: 'purple', name: 'Royal', color: '#a855f7' },
    { id: 'green', name: 'Forest', color: '#10b981' },
    { id: 'orange', name: 'Sunset', color: '#f97316' },
    { id: 'pink', name: 'Berry', color: '#ec4899' },
  ];

  const handleNavClick = (view: ViewType) => {
    onViewChange(view);
    setIsMobileMenuOpen(false);
  }

  const NavItem = ({ view, label, icon }: { view: ViewType, label: string, icon: React.ReactNode }) => (
    <button
      onClick={() => handleNavClick(view)}
      className={`w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-lg mb-1 transition-all duration-200 group relative ${currentView === view ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'}`}
    >
      <span className={`transition-colors ${currentView === view ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-300'}`}>
        {icon}
      </span>
      <span className="ml-3">{label}</span>
      {currentView === view && <span className="absolute right-4 w-1.5 h-1.5 rounded-full bg-primary-600 dark:bg-primary-400"></span>}
    </button>
  );

  const NavLinks = () => (
    <>
      <div className="px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 mt-2">Views</div>
      <NavItem
        view="board"
        label="Board"
        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
      />
      <NavItem
        view="list"
        label="List"
        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>}
      />
      <NavItem
        view="timeline"
        label="Timeline"
        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
      />

      <div className="px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 mt-6">Workspace</div>
      <NavItem
        view="my-tasks"
        label="My Tasks"
        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
      />
      <NavItem
        view="docs"
        label="Documents"
        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
      />
      <NavItem
        view="reports"
        label="Reports"
        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
      />

      <div className="mt-6 border-t border-gray-100 dark:border-gray-700 pt-2">
        <NavItem
          view="trash"
          label="Recycle Bin"
          icon={<svg className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}
        />
      </div>

      <div className="pt-4 border-t border-gray-100 dark:border-gray-700 mt-4 space-y-1">
        <button
          onClick={onGenerateSprint}
          className="w-full flex items-center px-4 py-2 text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 hover:bg-purple-50 dark:hover:bg-purple-900/10 rounded-lg transition-all"
        >
          <svg className="w-5 h-5 mr-3 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          Magic Sprint
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen w-full bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans overflow-hidden transition-colors duration-300">

      {/* Mobile Sidebar Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* ... (keep mobile sidebar content similar to desktop but simplified) ... */}
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">TaskFlow</span>
            <button onClick={() => setIsMobileMenuOpen(false)}>Close</button>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            <NavLinks />
          </nav>
        </div>
      </div>

      {/* Desktop Sidebar */}
      {!zenMode && (
        <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:flex flex-col transition-all duration-300 shrink-0">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-2 text-primary-600 dark:text-primary-500">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary-500/30">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">TaskFlow</span>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
            <NavLinks />

            {/* Feature 9: Sticky Note */}
            <div className="mt-8">
              <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Sticky Note</span>
                <span className="text-[10px] text-gray-300">Auto-saves</span>
              </div>
              <textarea
                value={stickyNote}
                onChange={(e) => setStickyNote(e.target.value)}
                placeholder="Scratchpad..."
                className="w-full h-32 p-3 text-sm bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-yellow-400 text-gray-700 dark:text-gray-300"
              />
            </div>
          </nav>

          <div className="px-4 pb-4">
            {/* Feature 8: User Status */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700 mb-3">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">JD</div>
                  <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-white dark:border-gray-800 rounded-full ${userStatus === 'online' ? 'bg-green-500' : userStatus === 'focus' ? 'bg-purple-500' : 'bg-yellow-500'}`}></div>
                </div>
                <select
                  value={userStatus}
                  onChange={(e) => setUserStatus(e.target.value as any)}
                  className="bg-transparent text-sm font-medium text-gray-900 dark:text-gray-100 outline-none cursor-pointer"
                >
                  <option value="online" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Online</option>
                  <option value="focus" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Focus Mode</option>
                  <option value="away" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Away</option>
                </select>
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700">
              <div className="flex items-center mb-2">
                <svg className="w-3 h-3 text-primary-500 mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11C14.017 11.5523 13.5693 12 13.017 12H12.017V5H22.017V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM5.0166 21L5.0166 18C5.0166 16.8954 5.91203 16 7.0166 16H10.0166C10.5689 16 11.0166 15.5523 11.0166 15V9C11.0166 8.44772 10.5689 8 10.0166 8H6.0166C5.46432 8 5.0166 8.44772 5.0166 9V11C5.0166 11.5523 4.56889 12 4.0166 12H3.0166V5H13.0166V15C13.0166 18.3137 10.3303 21 7.0166 21H5.0166Z" /></svg>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Daily Wisdom</span>
              </div>
              <p className="text-xs italic text-gray-600 dark:text-gray-400 leading-relaxed">"{quote}"</p>
            </div>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-gray-900 transition-colors duration-300 relative">

        {/* Header */}
        {!zenMode && (
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 px-4 sm:px-6 flex items-center justify-between shrink-0 z-20 transition-colors duration-300">

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 -ml-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
              </button>
              <div className="md:hidden font-bold text-lg text-gray-900 dark:text-white">TaskFlow</div>
              <div className="hidden md:flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
                <span className="hover:text-gray-900 dark:hover:text-white cursor-pointer">Workspace</span>
                <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                <span className="text-gray-900 dark:text-white capitalize">{currentView.replace('-', ' ')}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Feature 1: Pomodoro Timer */}
              <div className="hidden lg:flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={togglePomo}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center ${isPomoRunning ? 'bg-red-500 text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600'}`}
                >
                  <svg className="w-3 h-3 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {formatTime(pomoTime)}
                </button>
                <button
                  onClick={resetPomo}
                  className="px-2 py-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  title="Reset Timer"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                </button>
              </div>

              {/* Search */}
              <div className="relative hidden sm:block">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search tasks..."
                  className="w-48 pl-9 pr-4 py-1.5 bg-gray-100 dark:bg-gray-700 border-transparent focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent rounded-lg text-sm transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
                <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>

              {/* Zen Mode Toggle */}
              <button
                onClick={toggleZenMode}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
                title="Enter Zen Mode"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
              </button>

              {/* Automations Button */}
              <button
                onClick={onOpenAutomations}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
                title="Automations"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </button>

              {/* Keyboard Shortcuts */}
              <button
                onClick={onOpenShortcuts}
                className="hidden sm:block p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors font-mono font-bold text-xs"
                title="Keyboard Shortcuts (?)"
              >
                ?
              </button>

              {/* Theme Switcher */}
              <div className="relative" ref={themeMenuRef}>
                <button
                  onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </button>

                {isThemeMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 p-4 z-50 animate-fade-in-up">
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dark Mode</span>
                      <button
                        onClick={toggleDarkMode}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${darkMode ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                      >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${darkMode ? 'translate-x-5' : 'translate-x-0'}`}></span>
                      </button>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 block">Accent Color</span>
                      <div className="grid grid-cols-5 gap-2">
                        {themes.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => setColorTheme(t.id)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center focus:outline-none ring-2 ring-offset-2 dark:ring-offset-gray-800 transition-all ${colorTheme === t.id ? 'ring-gray-400 scale-110' : 'ring-transparent hover:scale-105'}`}
                            style={{ backgroundColor: t.color }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center">
                <UserButton afterSignOutUrl="/" />
              </div>

              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
                title="Invite Member"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </button>

              <button
                onClick={onNewTask}
                className="bg-gray-900 dark:bg-primary-600 hover:bg-gray-800 dark:hover:bg-primary-700 text-white text-sm font-medium py-2 px-3 sm:px-4 rounded-lg shadow-sm flex items-center transition-colors"
              >
                <svg className="w-4 h-4 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                <span className="hidden sm:inline">New Task</span>
              </button>
            </div>
          </header>
        )}

        {/* Feature 4: Zen Mode Exit Button */}
        {zenMode && (
          <button
            onClick={toggleZenMode}
            className="fixed top-4 right-4 z-50 bg-gray-800 text-white p-2 rounded-full shadow-lg opacity-50 hover:opacity-100 transition-opacity"
            title="Exit Zen Mode"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto relative z-0">
          {children}
        </div>

        {/* Floating Chat Button */}
        <div className="fixed bottom-6 right-6 z-40">
          {isChatOpen ? (
            <AiAssistant tasks={tasks} isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
          ) : (
            <button
              onClick={() => setIsChatOpen(true)}
              className="w-14 h-14 bg-gradient-to-r from-primary-600 to-indigo-600 rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-xl hover:scale-105 transition-all focus:outline-none focus:ring-4 focus:ring-primary-300"
            >
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            </button>
          )}
        </div>
        <InviteModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} />
      </main>
    </div>
  );
};

export default Layout;
