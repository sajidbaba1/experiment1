
import React from 'react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'N', desc: 'Create new task' },
    { key: '/', desc: 'Focus search' },
    { key: 'Esc', desc: 'Close modals' },
    { key: '?', desc: 'Toggle this menu' },
    { key: 'Cmd+K', desc: 'Quick command' },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden z-10 p-6 relative">
         <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
         </button>
         
         <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
           <svg className="w-5 h-5 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
           Keyboard Shortcuts
         </h2>
         
         <div className="space-y-3">
            {shortcuts.map(s => (
               <div key={s.key} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-300">{s.desc}</span>
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-xs font-mono font-bold text-gray-700 dark:text-gray-200">{s.key}</span>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default ShortcutsModal;
