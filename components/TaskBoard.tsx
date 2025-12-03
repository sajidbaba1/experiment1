
import React, { useState } from 'react';
import { Task, TaskStatus, TaskPriority } from '../types';
import TaskCard from './TaskCard';

interface TaskBoardProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskMove: (taskId: string, status: TaskStatus) => void;
  searchQuery: string;
  onQuickAddTask: (title: string, status: TaskStatus) => void;
  onClearDoneTasks: () => void;
  onAutoAssign: () => void;
}

type SortOption = 'priority' | 'dueDate' | 'created';

const TaskBoard: React.FC<TaskBoardProps> = ({ 
  tasks, 
  onTaskClick, 
  onTaskMove, 
  searchQuery, 
  onQuickAddTask,
  onClearDoneTasks,
  onAutoAssign
}) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('priority');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  
  // Feature 7: Zoom Control
  const [zoomLevel, setZoomLevel] = useState(1);
  
  const [quickAddTitles, setQuickAddTitles] = useState<Record<string, string>>({});

  const columns = Object.values(TaskStatus);
  const allTags = Array.from(new Set(tasks.flatMap(t => t.tags || [])));
  const allAssignees = Array.from(new Set(tasks.map(t => t.assignee || 'Unassigned')));

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = filterTag === 'all' || (task.tags && task.tags.includes(filterTag));
    const matchesAssignee = filterAssignee === 'all' || (task.assignee || 'Unassigned') === filterAssignee;
    return matchesSearch && matchesTag && matchesAssignee;
  });

  const getSortedTasks = (taskList: Task[]) => {
    return [...taskList].sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityWeight = { [TaskPriority.HIGH]: 3, [TaskPriority.MEDIUM]: 2, [TaskPriority.LOW]: 1 };
          return priorityWeight[b.priority] - priorityWeight[a.priority];
        case 'dueDate':
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'created':
        default:
          return b.createdAt - a.createdAt;
      }
    });
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return getSortedTasks(filteredTasks.filter(task => task.status === status));
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    if (draggedTaskId) {
      onTaskMove(draggedTaskId, status);
      setDraggedTaskId(null);
    }
  };

  const handleQuickAddChange = (status: string, value: string) => {
    setQuickAddTitles(prev => ({...prev, [status]: value}));
  };

  const handleQuickAddSubmit = (status: TaskStatus) => {
    const title = quickAddTitles[status]?.trim();
    if (title) {
      onQuickAddTask(title, status);
      setQuickAddTitles(prev => ({...prev, [status]: ''}));
    }
  };

  return (
    <div className="flex flex-col h-full">
       <div className="px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4 shrink-0 border-b border-transparent">
          <div className="flex flex-wrap items-center gap-4">
            
            <div className="flex items-center space-x-2">
               <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sort:</span>
               <div className="relative inline-block text-left">
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="block w-full pl-3 pr-8 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 dark:text-gray-200"
                  >
                     <option value="priority">Priority</option>
                     <option value="dueDate">Due Date</option>
                     <option value="created">Recently Added</option>
                  </select>
               </div>
            </div>

            <div className="flex items-center space-x-2">
               <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tag:</span>
               <div className="relative inline-block text-left">
                  <select 
                    value={filterTag}
                    onChange={(e) => setFilterTag(e.target.value)}
                    className="block w-full pl-3 pr-8 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 dark:text-gray-200"
                  >
                     <option value="all">All Tags</option>
                     {allTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
                  </select>
               </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
             {/* Zoom Control */}
             <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 p-1.5 rounded-lg border border-gray-200 dark:border-gray-700">
               <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
               <input 
                 type="range" 
                 min="0.7" 
                 max="1.3" 
                 step="0.1" 
                 value={zoomLevel} 
                 onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                 className="w-16 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
               />
               <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
             </div>

             <button 
                onClick={onAutoAssign}
                className="text-xs flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors border border-indigo-200 dark:border-indigo-800"
             >
                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                Auto Assign
             </button>
          </div>
       </div>

       <div className="flex-1 p-4 sm:p-6 pt-0 overflow-x-auto overflow-y-hidden mt-4">
         <div className="flex h-full space-x-4 sm:space-x-6 w-full snap-x snap-mandatory sm:snap-none pb-2">
            {columns.map((status) => {
              const columnTasks = getTasksByStatus(status);
              return (
                <div 
                  key={status} 
                  className={`flex-shrink-0 flex flex-col w-[85vw] sm:w-[300px] h-full snap-center sm:snap-align-none transition-colors rounded-xl ${draggedTaskId ? 'bg-gray-50/50 dark:bg-gray-800/30' : ''}`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, status)}
                  style={{ width: `calc(300px * ${zoomLevel})`, minWidth: `calc(280px * ${zoomLevel})` }}
                >
                  <div className="flex items-center justify-between mb-3 sm:mb-4 px-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 transition-colors uppercase tracking-wide">{status}</h3>
                      <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors">
                        {columnTasks.length}
                      </span>
                    </div>
                    {status === TaskStatus.DONE && columnTasks.length > 0 && (
                      <button 
                        onClick={onClearDoneTasks}
                        className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                        title="Clear completed tasks"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  <div className={`flex-1 bg-gray-100/50 dark:bg-gray-800/50 rounded-xl p-2 sm:p-3 space-y-3 overflow-y-auto custom-scrollbar border border-gray-100/50 dark:border-gray-700/50 transition-colors ${draggedTaskId ? 'ring-2 ring-dashed ring-gray-200 dark:ring-gray-700' : ''}`}>
                    {columnTasks.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-24 sm:h-32 text-gray-400 dark:text-gray-600 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg m-1 transition-colors">
                         <span className="text-xs">No tasks</span>
                         <span className="text-[10px] mt-1 opacity-50">Drop here</span>
                      </div>
                    ) : (
                      columnTasks.map(task => (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          className="cursor-grab active:cursor-grabbing transform transition-transform hover:-translate-y-0.5"
                          style={{ fontSize: `${zoomLevel}rem` }}
                        >
                          <TaskCard task={task} onClick={onTaskClick} />
                        </div>
                      ))
                    )}
                  </div>
                  
                  <div className="mt-3 px-1">
                    <div className="relative group">
                       <input 
                         type="text" 
                         value={quickAddTitles[status] || ''}
                         onChange={(e) => handleQuickAddChange(status, e.target.value)}
                         onKeyDown={(e) => e.key === 'Enter' && handleQuickAddSubmit(status)}
                         placeholder=" + Quick Add..."
                         className="w-full bg-transparent border-b border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-primary-500 focus:ring-0 text-sm py-1 px-1 transition-colors outline-none text-gray-700 dark:text-gray-300 placeholder-gray-400"
                       />
                       <button 
                         onClick={() => handleQuickAddSubmit(status)}
                         className={`absolute right-0 top-1 text-primary-600 dark:text-primary-400 hover:text-primary-800 ${quickAddTitles[status] ? 'opacity-100' : 'opacity-0'} transition-opacity`}
                       >
                         <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                       </button>
                    </div>
                  </div>
                </div>
              );
            })}
         </div>
      </div>
    </div>
  );
};

export default TaskBoard;
