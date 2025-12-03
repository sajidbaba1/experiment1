
import React from 'react';
import { Task, TaskPriority } from '../types';
import Button from './Button';

interface TrashViewProps {
  deletedTasks: Task[];
  onRestore: (id: string) => void;
  onPermDelete: (id: string) => void;
  onEmptyTrash: () => void;
}

const TrashView: React.FC<TrashViewProps> = ({ deletedTasks, onRestore, onPermDelete, onEmptyTrash }) => {
  return (
    <div className="p-6">
       <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
             <svg className="w-6 h-6 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
             Recycle Bin
          </h2>
          {deletedTasks.length > 0 && (
             <Button variant="danger" onClick={onEmptyTrash}>Empty Trash</Button>
          )}
       </div>

       {deletedTasks.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
             <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
               <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
             </div>
             <p className="text-gray-500 dark:text-gray-400 font-medium">Trash is empty.</p>
             <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Deleted items will appear here.</p>
          </div>
       ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
             <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                   <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Task</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Original Priority</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                   {deletedTasks.map(task => (
                      <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                         <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">{task.description}</div>
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                               task.priority === TaskPriority.HIGH ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 
                               task.priority === TaskPriority.MEDIUM ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 
                               'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            }`}>
                               {task.priority}
                            </span>
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                            <button onClick={() => onRestore(task.id)} className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">Restore</button>
                            <span className="text-gray-300">|</span>
                            <button onClick={() => onPermDelete(task.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Delete Forever</button>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
       )}
    </div>
  );
};

export default TrashView;
