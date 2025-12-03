import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  onNewTask: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onNewTask }) => {
  return (
    <div className="flex h-screen w-full bg-gray-100 text-gray-900 font-sans overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-2 text-primary-600">
             <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary-500/30">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
             </div>
             <span className="text-xl font-bold tracking-tight text-gray-900">TaskFlow</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          <a href="#" className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg bg-primary-50 text-primary-700 group relative">
             <svg className="w-5 h-5 mr-3 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
             Board View
             <span className="absolute right-4 w-2 h-2 rounded-full bg-primary-600"></span>
          </a>
          <a href="#" className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 group">
             <svg className="w-5 h-5 mr-3 text-gray-400 group-hover:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
             List View
          </a>
          <a href="#" className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 group">
             <svg className="w-5 h-5 mr-3 text-gray-400 group-hover:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
             Reports
          </a>
        </nav>

        <div className="p-4 border-t border-gray-100">
           <div className="bg-gradient-to-r from-primary-600 to-indigo-600 rounded-xl p-4 text-white">
              <h4 className="font-bold text-sm mb-1">Upgrade to Pro</h4>
              <p className="text-xs text-primary-100 mb-3">Get unlimited tasks and AI insights.</p>
              <button className="w-full py-1.5 bg-white text-primary-600 text-xs font-bold rounded shadow hover:bg-gray-50 transition-colors">Upgrade Now</button>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-gray-50">
        
        {/* Header */}
        <header className="bg-white border-b border-gray-200 h-16 px-6 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center md:hidden">
            <span className="font-bold text-xl text-gray-900">TaskFlow</span>
          </div>

          <div className="hidden md:flex items-center text-sm font-medium text-gray-500">
            <span className="hover:text-gray-900 cursor-pointer">Workspace</span>
            <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <span className="text-gray-900">Engineering</span>
          </div>

          <div className="flex items-center space-x-4">
             {/* Search */}
             <div className="hidden sm:block relative">
               <input 
                 type="text" 
                 placeholder="Search tasks..." 
                 className="w-64 pl-9 pr-4 py-1.5 bg-gray-100 border-transparent focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent rounded-lg text-sm transition-all"
               />
               <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
             </div>

             <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

             <button 
                onClick={onNewTask}
                className="bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium py-2 px-4 rounded-lg shadow-sm flex items-center transition-colors"
             >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                New Task
             </button>
             
             <div className="w-8 h-8 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center cursor-pointer">
                <span className="text-xs font-bold text-gray-600">JD</span>
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