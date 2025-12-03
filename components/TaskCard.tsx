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

  // Calculate Subtask Progress from Description Markdown
  // Looks for "- [ ]" (incomplete) and "- [x]" (complete)
  const totalSubtasks = (task.description.match(/- \[[ x]\]/g) || []).length;
  const completedSubtasks = (task.description.match(/- \[x\]/g) || []).length;
  const progressPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  return (
    <div 
      onClick={() => onClick(task)}
      className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700 transition-all cursor-pointer group flex flex-col gap-2"
    >
      <div className="flex justify-between items-start">
        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full border ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
        {task.dueDate && (
          <span className={`text-xs flex items-center ${new Date(task.dueDate) < new Date() ? 'text-red-500 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>
      
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
        {task.title}
      </h3>
      
      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.tags.map((tag, i) => (
             <span key={i} className="px-1.5 py-0.5 rounded text-[10px] bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 font-medium border border-gray-200 dark:border-gray-600">
               {tag}
             </span>
          ))}
        </div>
      )}

      {/* Subtask Progress Bar */}
      {totalSubtasks > 0 && (
        <div className="mt-1">
           <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400 mb-1">
              <span>Progress</span>
              <span>{completedSubtasks}/{totalSubtasks}</span>
           </div>
           <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
             <div 
                className={`h-full rounded-full transition-all duration-500 ${progressPercent === 100 ? 'bg-green-500' : 'bg-primary-500'}`} 
                style={{ width: `${progressPercent}%` }}
             ></div>
           </div>
        </div>
      )}

      <div className="flex justify-between items-center pt-2 mt-auto border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-2">
           {/* Assignee Avatar */}
           <div className="h-6 w-6 rounded-full ring-2 ring-white dark:ring-gray-800 bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-[10px] font-bold">
             {task.assignee ? task.assignee.substring(0, 2).toUpperCase() : 'UN'}
           </div>
           
           {/* Comments Count */}
           {task.comments && task.comments.length > 0 && (
             <div className="flex items-center text-xs text-gray-400 dark:text-gray-500">
                <svg className="w-3.5 h-3.5 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                {task.comments.length}
             </div>
           )}
        </div>
        <div className="text-xs text-gray-400 dark:text-gray-500 font-mono">
          #{task.id.substring(0, 4)}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;