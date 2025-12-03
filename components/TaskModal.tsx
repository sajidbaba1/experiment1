import React, { useState, useEffect, useRef } from 'react';
import { Task, TaskPriority, TaskStatus, Comment } from '../types';
import Button from './Button';
import { enhanceTaskDescription, suggestSubtasks } from '../services/geminiService';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
  onDelete?: (id: string) => void;
  onAddComment?: (taskId: string, text: string) => void;
  task?: Task;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, onDelete, onAddComment, task }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.TODO);
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [dueDate, setDueDate] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [suggestedSubtasks, setSuggestedSubtasks] = useState<string[]>([]);
  
  // Comment State
  const [newComment, setNewComment] = useState('');
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setStatus(task.status);
      setPriority(task.priority);
      setDueDate(task.dueDate);
      setTags(task.tags || []);
      setSuggestedSubtasks([]);
    } else {
      // Reset for new task
      setTitle('');
      setDescription('');
      setStatus(TaskStatus.TODO);
      setPriority(TaskPriority.MEDIUM);
      setDueDate(new Date().toISOString().split('T')[0]);
      setTags([]);
      setSuggestedSubtasks([]);
    }
    setNewComment('');
    setTagInput('');
  }, [task, isOpen]);

  // Scroll to bottom of comments when task changes or new comment added
  useEffect(() => {
    if (isOpen && task) {
       setTimeout(() => {
         commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
       }, 100);
    }
  }, [task?.comments, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      id: task?.id,
      title,
      description: suggestedSubtasks.length > 0 ? description + "\n\n**Subtasks:**\n" + suggestedSubtasks.map(s => `- [ ] ${s}`).join('\n') : description,
      status,
      priority,
      dueDate,
      tags
    });
    onClose();
  };

  const handleAiEnhance = async () => {
    if (!title) return;
    setIsAiLoading(true);
    try {
      const enhancedDesc = await enhanceTaskDescription(title, description);
      setDescription(enhancedDesc);
      
      const subtasks = await suggestSubtasks(title, enhancedDesc);
      setSuggestedSubtasks(subtasks);
    } catch (e) {
      console.error("AI enhancement failed", e);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handlePostComment = () => {
    if (newComment.trim() && task && onAddComment) {
      onAddComment(task.id, newComment);
      setNewComment('');
    }
  };

  const handleKeyDownComment = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handlePostComment();
    }
  };

  // Tag Handlers
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-6">
      <div 
        className="fixed inset-0 bg-gray-900 bg-opacity-40 dark:bg-opacity-80 transition-opacity backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="bg-white dark:bg-gray-800 sm:rounded-xl shadow-2xl w-full h-full sm:h-auto sm:max-w-2xl transform transition-all flex flex-col sm:max-h-[90vh] z-10 border border-gray-100 dark:border-gray-700">
        
        {/* Header */}
        <div className="flex justify-between items-center px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-700 shrink-0">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {task ? 'Edit Task' : 'New Task'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-200 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar space-y-6 flex-1">
          
          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Task Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Redesign Landing Page"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow outline-none text-gray-900 dark:text-white dark:bg-gray-700 font-medium placeholder-gray-400"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
             {/* Status */}
             <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm text-gray-900 dark:text-white"
              >
                {Object.values(TaskStatus).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm text-gray-900 dark:text-white"
              >
                {Object.values(TaskPriority).map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm text-gray-600 dark:text-gray-300"
              />
            </div>
          </div>
          
          {/* Tags Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags</label>
            <div className="flex flex-wrap items-center gap-2 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus-within:ring-2 focus-within:ring-primary-500">
               {tags.map((tag, idx) => (
                 <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                   {tag}
                   <button onClick={() => removeTag(tag)} className="ml-1 text-primary-600 dark:text-primary-400 hover:text-primary-800 focus:outline-none">
                     ×
                   </button>
                 </span>
               ))}
               <input 
                 type="text" 
                 value={tagInput}
                 onChange={(e) => setTagInput(e.target.value)}
                 onKeyDown={handleAddTag}
                 placeholder={tags.length === 0 ? "Add tags (press Enter)..." : ""}
                 className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400 min-w-[120px]"
               />
            </div>
          </div>

          {/* Description + AI */}
          <div className="relative">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
              <button 
                type="button"
                onClick={handleAiEnhance}
                disabled={isAiLoading || !title}
                className="flex items-center text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 disabled:opacity-50 transition-colors"
              >
                {isAiLoading ? (
                   <span className="flex items-center">
                     <svg className="animate-spin -ml-1 mr-1 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                     Thinking...
                   </span>
                ) : (
                  <span className="flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    AI Enhance
                  </span>
                )}
              </button>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow outline-none text-sm text-gray-700 dark:text-gray-300 resize-none bg-gray-50 dark:bg-gray-700"
              placeholder="Describe task details... Use '- [ ]' for checklist items."
            />
            {suggestedSubtasks.length > 0 && (
                <div className="mt-3 bg-purple-50 dark:bg-purple-900/20 p-3 rounded-md border border-purple-100 dark:border-purple-800">
                    <p className="text-xs font-bold text-purple-800 dark:text-purple-300 mb-2">✨ AI Suggested Subtasks (Will be saved to description)</p>
                    <ul className="space-y-1">
                        {suggestedSubtasks.map((st, idx) => (
                            <li key={idx} className="text-xs text-purple-700 dark:text-purple-400 flex items-start">
                                <span className="mr-1.5">•</span> {st}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
          </div>

          {/* Comments Section - Only show for existing tasks */}
          {task && (
            <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Activity & Comments</h3>
              
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 sm:p-4 mb-3 max-h-48 overflow-y-auto custom-scrollbar">
                {!task.comments || task.comments.length === 0 ? (
                  <p className="text-center text-xs text-gray-400 dark:text-gray-500 py-2">No comments yet. Start the conversation!</p>
                ) : (
                  <div className="space-y-3">
                    {task.comments.map((comment: Comment) => (
                      <div key={comment.id} className="flex space-x-2">
                        <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-[10px] font-bold text-primary-600 dark:text-primary-400 shrink-0 mt-0.5">
                          {comment.author.substring(0,2).toUpperCase()}
                        </div>
                        <div className="flex-1">
                           <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-gray-900 dark:text-gray-200">{comment.author}</span>
                              <span className="text-[10px] text-gray-400">
                                {new Date(comment.createdAt).toLocaleDateString()} {new Date(comment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                           </div>
                           <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">{comment.text}</p>
                        </div>
                      </div>
                    ))}
                    <div ref={commentsEndRef} />
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                 <input 
                   type="text" 
                   value={newComment}
                   onChange={(e) => setNewComment(e.target.value)}
                   onKeyDown={handleKeyDownComment}
                   placeholder="Write a comment..."
                   className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none dark:bg-gray-700 dark:text-white"
                 />
                 <Button size="sm" onClick={handlePostComment} disabled={!newComment.trim()}>
                   Post
                 </Button>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-4 bg-gray-50 dark:bg-gray-750 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center sm:rounded-b-xl shrink-0 safe-pb-4">
          {task && onDelete ? (
             <Button 
                variant="danger" 
                size="sm" 
                onClick={() => {
                  if(window.confirm('Are you sure you want to delete this task?')) {
                    onDelete(task.id);
                    onClose();
                  }
                }}
              >
                Delete
              </Button>
          ) : <div></div>}
          
          <div className="flex space-x-3">
            <Button variant="secondary" onClick={onClose} className="dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600">Cancel</Button>
            <Button variant="primary" onClick={handleSave}>
              {task ? 'Save Changes' : 'Create Task'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;