import React from 'react';
import { Task, TaskStatus } from '../types';
import TaskCard from './TaskCard';

interface TaskBoardProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, onTaskClick }) => {
  
  const columns = Object.values(TaskStatus);

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => task.status === status);
  };

  return (
    <div className="h-full p-6 overflow-x-auto">
       <div className="flex h-full space-x-6 min-w-[1000px]">
          {columns.map((status) => {
            const columnTasks = getTasksByStatus(status);
            return (
              <div key={status} className="flex-1 flex flex-col min-w-[280px] max-w-xs h-full">
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4 px-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 transition-colors">{status}</h3>
                    <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors">
                      {columnTasks.length}
                    </span>
                  </div>
                  <div className="flex space-x-1">
                     <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                     </button>
                  </div>
                </div>

                {/* Column Content */}
                <div className="flex-1 bg-gray-100/50 dark:bg-gray-800/50 rounded-xl p-2 space-y-3 overflow-y-auto custom-scrollbar border border-gray-100/50 dark:border-gray-700/50 transition-colors">
                  {columnTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-gray-400 dark:text-gray-600 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg m-1 transition-colors">
                       <span className="text-xs">No tasks</span>
                    </div>
                  ) : (
                    columnTasks.map(task => (
                      <TaskCard key={task.id} task={task} onClick={onTaskClick} />
                    ))
                  )}
                </div>
              </div>
            );
          })}
       </div>
    </div>
  );
};

export default TaskBoard;