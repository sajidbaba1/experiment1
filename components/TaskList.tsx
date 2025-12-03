import React, { useState } from 'react';
import { Task, TaskStatus, TaskPriority } from '../types';

interface TaskListProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

type SortField = 'title' | 'status' | 'priority' | 'dueDate' | 'assignee';

const TaskList: React.FC<TaskListProps> = ({ tasks, onTaskClick }) => {
  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    let result = 0;
    if (sortField === 'title') result = a.title.localeCompare(b.title);
    if (sortField === 'status') result = a.status.localeCompare(b.status);
    if (sortField === 'assignee') result = (a.assignee || '').localeCompare(b.assignee || '');
    if (sortField === 'priority') {
       const priorityWeight = { [TaskPriority.HIGH]: 3, [TaskPriority.MEDIUM]: 2, [TaskPriority.LOW]: 1 };
       result = priorityWeight[a.priority] - priorityWeight[b.priority];
    }
    if (sortField === 'dueDate') {
       result = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    
    return sortDirection === 'asc' ? result : -result;
  });

  const getPriorityBadge = (priority: TaskPriority) => {
    const styles = {
      [TaskPriority.LOW]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
      [TaskPriority.MEDIUM]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
      [TaskPriority.HIGH]: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
    };
    return (
      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[priority]}`}>
        {priority}
      </span>
    );
  };

  const getStatusBadge = (status: TaskStatus) => {
    const styles = {
      [TaskStatus.TODO]: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      [TaskStatus.IN_PROGRESS]: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
      [TaskStatus.REVIEW]: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
      [TaskStatus.DONE]: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    };
    return (
      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status]}`}>
        {status}
      </span>
    );
  };

  const TH = ({ field, label }: { field: SortField, label: string }) => (
    <th 
      onClick={() => handleSort(field)}
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
    >
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        {sortField === field && (
           <svg className={`w-3 h-3 transition-transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
        )}
      </div>
    </th>
  );

  return (
    <div className="p-6">
       <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
             <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
               <thead className="bg-gray-50 dark:bg-gray-700/50">
                 <tr>
                   <TH field="title" label="Task" />
                   <TH field="status" label="Status" />
                   <TH field="priority" label="Priority" />
                   <TH field="assignee" label="Assignee" />
                   <TH field="dueDate" label="Due Date" />
                 </tr>
               </thead>
               <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                 {sortedTasks.map((task) => (
                   <tr 
                     key={task.id} 
                     onClick={() => onTaskClick(task)}
                     className="hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition-colors"
                   >
                     <td className="px-6 py-4 whitespace-nowrap">
                       <div className="flex items-center">
                         <div className="ml-0">
                           <div className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</div>
                           <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">{task.description}</div>
                         </div>
                       </div>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                       {getStatusBadge(task.status)}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                       {getPriorityBadge(task.priority)}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-primary-500 to-indigo-500 flex items-center justify-center text-[10px] text-white font-bold mr-2">
                            {task.assignee ? task.assignee.substring(0,2).toUpperCase() : 'UN'}
                          </div>
                          {task.assignee || 'Unassigned'}
                        </div>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                       {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric'})}
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
             {sortedTasks.length === 0 && (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  No tasks found.
                </div>
             )}
          </div>
       </div>
    </div>
  );
};

export default TaskList;