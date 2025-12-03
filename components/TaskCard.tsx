import React from 'react';
import { Task, TaskPriority } from '../types';

interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  
  const priorityColors = {
    [TaskPriority.LOW]: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
    [TaskPriority.MEDIUM]: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
    [TaskPriority.HIGH]: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
  };

  return (
    <div 
      onClick={() => onClick(task)}
      className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700 transition-all cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-2">
        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full border ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
        {task.dueDate && (
          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>
      
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1 leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
        {task.title}
      </h3>
      
      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 h-8">
        {task.description || "No description provided."}
      </p>

      <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
        <div className="flex -space-x-1 overflow-hidden">
           {/* Mock Avatar */}
           <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-gray-800 bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-[10px] font-bold">
             {task.assignee ? task.assignee.substring(0, 2).toUpperCase() : 'UN'}
           </div>
        </div>
        <div className="text-xs text-gray-400 dark:text-gray-500 font-mono">
          #{task.id.substring(0, 4)}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;