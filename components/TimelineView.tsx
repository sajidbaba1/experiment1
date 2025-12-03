
import React, { useMemo } from 'react';
import { Task, TaskPriority } from '../types';

interface TimelineViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

const TimelineView: React.FC<TimelineViewProps> = ({ tasks, onTaskClick }) => {
  // Simple Timeline Logic: 
  // X-Axis: Last 30 days to Next 30 days
  // Y-Axis: Tasks
  
  const daysToShow = 30; // 15 past, 15 future
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 15);
  
  const dates = Array.from({ length: daysToShow }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    return d;
  });

  const getPosition = (dateStr: string) => {
    if (!dateStr) return -1;
    const d = new Date(dateStr);
    d.setHours(0,0,0,0);
    const diff = Math.ceil((d.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getDuration = (task: Task) => {
     // If created and due exist, diff them. Else default 1 day or 3 days.
     const start = new Date(task.createdAt);
     const end = task.dueDate ? new Date(task.dueDate) : new Date(start.getTime() + (86400000 * 2)); 
     const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
     return Math.max(diffDays, 1);
  };

  const getStartPos = (task: Task) => {
      // Use createdAt as start if within range, else clamp
      const d = new Date(task.createdAt);
      d.setHours(0,0,0,0);
      const diff = Math.ceil((d.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      return diff;
  };

  // Filter tasks visible in this window
  const visibleTasks = tasks.filter(t => {
      const start = getStartPos(t);
      const end = start + getDuration(t);
      return end >= 0 && start < daysToShow;
  });

  const colWidth = 40; // px
  const rowHeight = 44; // px

  const priorityColors = {
    [TaskPriority.LOW]: 'bg-blue-200 border-blue-400 text-blue-800 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-100',
    [TaskPriority.MEDIUM]: 'bg-yellow-200 border-yellow-400 text-yellow-800 dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-100',
    [TaskPriority.HIGH]: 'bg-red-200 border-red-400 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-100',
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
         <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            Project Timeline
         </h2>
         <div className="text-xs text-gray-500">
            Showing 30 day window
         </div>
      </div>
      
      <div className="flex-1 overflow-auto custom-scrollbar relative">
         <div style={{ width: `${dates.length * colWidth}px`, minWidth: '100%' }}>
            
            {/* Header Dates */}
            <div className="flex sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
               <div className="w-48 shrink-0 p-2 text-sm font-bold text-gray-600 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 sticky left-0 bg-white dark:bg-gray-800 z-20">Task Name</div>
               {dates.map((d, i) => (
                  <div key={i} className={`shrink-0 w-[40px] p-2 text-center border-r border-gray-100 dark:border-gray-700 ${d.getDate() === today.getDate() && d.getMonth() === today.getMonth() ? 'bg-primary-50 dark:bg-primary-900/30' : ''}`}>
                     <div className="text-[10px] uppercase text-gray-400 font-bold">{d.toLocaleDateString(undefined, {weekday: 'narrow'})}</div>
                     <div className={`text-xs font-medium ${d.getDate() === today.getDate() && d.getMonth() === today.getMonth() ? 'text-primary-600 dark:text-primary-400 font-bold' : 'text-gray-600 dark:text-gray-300'}`}>{d.getDate()}</div>
                  </div>
               ))}
            </div>

            {/* Grid Body */}
            <div className="relative">
               {/* Vertical Grid Lines */}
               <div className="absolute inset-0 flex pl-48 pointer-events-none">
                  {dates.map((_, i) => (
                     <div key={i} className="w-[40px] border-r border-gray-100 dark:border-gray-700/50 h-full"></div>
                  ))}
               </div>

               {/* Today Line marker */}
               <div 
                  className="absolute top-0 bottom-0 border-l-2 border-red-400 z-0 opacity-50 pointer-events-none"
                  style={{ left: `${48 * 4 + 15 * 40}px` /* approx math for demo */ }} 
               ></div>

               {/* Rows */}
               {visibleTasks.map((task) => {
                  const startOffset = Math.max(0, getStartPos(task));
                  const duration = getDuration(task);
                  // Clamp visualization to grid
                  const width = Math.min(duration, daysToShow - startOffset);
                  
                  if (width <= 0) return null;

                  return (
                     <div key={task.id} className="flex border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <div className="w-48 shrink-0 p-3 text-sm font-medium text-gray-700 dark:text-gray-200 border-r border-gray-200 dark:border-gray-700 sticky left-0 bg-white dark:bg-gray-800 z-10 truncate">
                           {task.title}
                        </div>
                        <div className="relative flex-1 h-[44px]">
                           <div 
                              onClick={() => onTaskClick(task)}
                              className={`absolute top-2 h-7 rounded-md shadow-sm border text-[10px] flex items-center px-2 cursor-pointer hover:brightness-95 transition-all truncate ${priorityColors[task.priority]}`}
                              style={{
                                 left: `${startOffset * colWidth}px`,
                                 width: `${width * colWidth}px`
                              }}
                           >
                              {task.title}
                           </div>
                        </div>
                     </div>
                  );
               })}
               
               {visibleTasks.length === 0 && (
                   <div className="p-8 text-center text-gray-400">No tasks visible in this time range.</div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};

export default TimelineView;
