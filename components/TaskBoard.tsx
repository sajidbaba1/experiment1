import React, { useState } from 'react';
import { Task, TaskStatus, TaskPriority } from '../types';
import TaskCard from './TaskCard';

interface TaskBoardProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskMove: (taskId: string, status: TaskStatus) => void;
}

type SortOption = 'priority' | 'dueDate' | 'created';

const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, onTaskClick, onTaskMove }) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('priority');
  
  const columns = Object.values(TaskStatus);

  // Sorting Logic
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
    return getSortedTasks(tasks.filter(task => task.status === status));
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
    // Transparent drag image
    // const img = new Image();
    // img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    // e.dataTransfer.setDragImage(img, 0, 0);
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

  return (
    <div className="flex flex-col h-full">
       {/* Sorting & Filter Toolbar */}
       <div className="px-4 sm:px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
             <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sort by:</span>
             <div className="relative inline-block text-left">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="block w-full pl-3 pr-8 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 dark:text-gray-200 cursor-pointer"
                >
                   <option value="priority">Highest Priority</option>
                   <option value="dueDate">Due Date (Earliest)</option>
                   <option value="created">Recently Added</option>
                </select>
             </div>
          </div>
       </div>

       {/* Board */}
       <div className="flex-1 p-4 sm:p-6 pt-0 overflow-x-auto overflow-y-hidden">
         {/* Responsive Container: Allows snapping on mobile, free scroll on desktop */}
         <div className="flex h-full space-x-4 sm:space-x-6 w-full snap-x snap-mandatory sm:snap-none pb-2">
            {columns.map((status) => {
              const columnTasks = getTasksByStatus(status);
              return (
                <div 
                  key={status} 
                  className={`flex-shrink-0 flex flex-col w-[85vw] sm:w-[300px] h-full snap-center sm:snap-align-none transition-colors rounded-xl ${draggedTaskId ? 'bg-gray-50/50 dark:bg-gray-800/30' : ''}`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, status)}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-3 sm:mb-4 px-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 transition-colors uppercase tracking-wide">{status}</h3>
                      <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors">
                        {columnTasks.length}
                      </span>
                    </div>
                    <div className="flex space-x-1">
                       <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                       </button>
                    </div>
                  </div>

                  {/* Column Content */}
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
                        >
                          <TaskCard task={task} onClick={onTaskClick} />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
            
            {/* Spacer for mobile to allow scrolling to the very end comfortably */}
            <div className="w-4 sm:hidden flex-shrink-0"></div>
         </div>
      </div>
    </div>
  );
};

export default TaskBoard;