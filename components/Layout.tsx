import React, { useState, useRef, useEffect } from 'react';

interface LayoutProps {
  children: React.ReactNode;
  onNewTask: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  colorTheme: string;
  setColorTheme: (theme: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  onNewTask,
  darkMode,
  toggleDarkMode,
  colorTheme,
  setColorTheme
}) => {
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  // Close theme menu when clicking outside
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

  return (
    <div className="flex h-screen w-full bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans overflow-hidden transition-colors duration-300">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:flex flex-col transition-colors duration-300">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-2 text-primary-600 dark:text-primary-500">
             <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary-500/30">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
             </div>
             <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">TaskFlow</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          <a href="#" className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400 group relative transition-colors">
             <svg className="w-5 h-5 mr-3 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
             Board View
             <span className="absolute right-4 w-2 h-2 rounded-full bg-primary-600 dark:bg-primary-400"></span>
          </a>
          <a href="#" className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white group transition-colors">
             <svg className="w-5 h-5 mr-3 text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
             List View
          </a>
          <a href="#" className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white group transition-colors">
             <svg className="w-5 h-5 mr-3 text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
             Reports
          </a>
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
           <div className="bg-gradient-to-r from-primary-600 to-indigo-600 rounded-xl p-4 text-white shadow-lg">
              <h4 className="font-bold text-sm mb-1">Upgrade to Pro</h4>
              <p className="text-xs text-primary-100 mb-3">Get unlimited tasks and AI insights.</p>
              <button className="w-full py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-xs font-bold rounded shadow transition-colors">Upgrade Now</button>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 px-6 flex items-center justify-between shrink-0 z-20 transition-colors duration-300">
          <div className="flex items-center md:hidden">
            <span className="font-bold text-xl text-gray-900 dark:text-white">TaskFlow</span>
          </div>

          <div className="hidden md:flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
            <span className="hover:text-gray-900 dark:hover:text-white cursor-pointer">Workspace</span>
            <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <span className="text-gray-900 dark:text-white">Engineering</span>
          </div>

          <div className="flex items-center space-x-4">
             {/* Search */}
             <div className="hidden sm:block relative">
               <input 
                 type="text" 
                 placeholder="Search tasks..." 
                 className="w-64 pl-9 pr-4 py-1.5 bg-gray-100 dark:bg-gray-700 border-transparent focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent rounded-lg text-sm transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
               />
               <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
             </div>

             <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>

             {/* Theme Switcher */}
             <div className="relative" ref={themeMenuRef}>
               <button 
                 onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                 className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                 title="Change Theme"
               >
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                 </svg>
               </button>

               {isThemeMenuOpen && (
                 <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 p-4 z-50 animate-fade-in-down">
                    
                    {/* Dark Mode Toggle */}
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dark Mode</span>
                      <button 
                        onClick={toggleDarkMode}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${darkMode ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                      >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${darkMode ? 'translate-x-5' : 'translate-x-0'}`}>
                          {darkMode ? (
                             <svg className="h-3 w-3 text-primary-600 m-1" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path></svg>
                          ) : (
                             <svg className="h-3 w-3 text-yellow-500 m-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z" clipRule="evenodd"></path></svg>
                          )}
                        </span>
                      </button>
                    </div>

                    {/* Accent Color Picker */}
                    <div>
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 block">Accent Color</span>
                      <div className="grid grid-cols-5 gap-2">
                        {themes.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => setColorTheme(t.id)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center focus:outline-none ring-2 ring-offset-2 dark:ring-offset-gray-800 transition-all ${colorTheme === t.id ? 'ring-gray-400 scale-110' : 'ring-transparent hover:scale-105'}`}
                            style={{ backgroundColor: t.color }}
                            title={t.name}
                          >
                            {colorTheme === t.id && (
                              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                 </div>
               )}
             </div>

             <button 
                onClick={onNewTask}
                className="bg-gray-900 dark:bg-primary-600 hover:bg-gray-800 dark:hover:bg-primary-700 text-white text-sm font-medium py-2 px-4 rounded-lg shadow-sm flex items-center transition-colors"
             >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                New Task
             </button>
             
             <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 flex items-center justify-center cursor-pointer">
                <span className="text-xs font-bold text-gray-600 dark:text-gray-300">JD</span>
             </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto">
           {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;