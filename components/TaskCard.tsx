
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
  const description = task.description || '';
  const totalSubtasks = (description.match(/- \[[ x]\]/g) || []).length;
  const completedSubtasks = (description.match(/- \[x\]/g) || []).length;
  const progressPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;
  const isBlocked = task.blockedBy && task.blockedBy.length > 0;

  const getRelativeTime = (timestamp: number) => {
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const diffInSeconds = (timestamp - Date.now()) / 1000;
    const diffInDays = Math.round(diffInSeconds / 86400);

    if (Math.abs(diffInDays) > 0) return rtf.format(diffInDays, 'day');
    return 'Today';
  };

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(task.id);
  };

  const getTagColor = (tag: string) => {
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
      hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div
      onClick={() => onClick(task)}
      className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border ${isBlocked ? 'border-red-300 dark:border-red-800 ring-2 ring-red-100 dark:ring-red-900/20' : 'border-gray-200 dark:border-gray-700'} hover:shadow-md transition-all cursor-pointer group flex flex-col gap-2 relative`}
    >
      {isBlocked && (
        <div className="absolute -top-2 -right-2 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-200 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm flex items-center border border-red-200 dark:border-red-800 z-10">
          <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          Blocked
        </div>
      )}

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
            <span key={i} className={`px-1.5 py-0.5 rounded text-[10px] font-medium border border-transparent ${getTagColor(tag)}`}>
              {tag}
            </span>
          ))}
        </div>
      )}

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

      {task.estimatedTime && (
        <div className="flex items-center text-[10px] text-gray-400 dark:text-gray-500 mt-1">
          <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {task.estimatedTime}h est.
        </div>
      )}

      <div className="flex justify-between items-center pt-2 mt-auto border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          {/* Assignee Avatar */}
          <div className="h-6 w-6 rounded-full ring-2 ring-white dark:ring-gray-800 bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-[10px] font-bold" title={task.assignee || 'Unassigned'}>
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
        <div
          onClick={handleCopyId}
          className="text-xs text-gray-300 dark:text-gray-600 font-mono hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
          title="Click to copy ID"
        >
          {getRelativeTime(task.createdAt)}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
