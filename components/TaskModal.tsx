
import React, { useState, useEffect, useRef } from 'react';
import { Task, TaskPriority, TaskStatus, Comment } from '../types';
import Button from './Button';
import { enhanceTaskDescription, suggestSubtasks, summarizeComments } from '../services/geminiService';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
  onDelete?: (id: string) => void;
  onAddComment?: (taskId: string, text: string) => void;
  onDuplicate?: (task: Task) => void;
  onAddReaction?: (taskId: string, commentId: string, emoji: string) => void;
  task?: Task;
  allTasks?: Task[]; // Passed to select dependencies
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, onDelete, onAddComment, onDuplicate, onAddReaction, task, allTasks = [] }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.TODO);
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [dueDate, setDueDate] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [estimatedTime, setEstimatedTime] = useState<number | ''>(''); 
  const [blockedBy, setBlockedBy] = useState<string[]>([]);
  
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [suggestedSubtasks, setSuggestedSubtasks] = useState<string[]>([]);
  
  // Comment State
  const [newComment, setNewComment] = useState('');
  const [commentSummary, setCommentSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  
  // Feature 2: Voice Input
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setStatus(task.status);
      setPriority(task.priority);
      setDueDate(task.dueDate);
      setTags(task.tags || []);
      setEstimatedTime(task.estimatedTime || '');
      setBlockedBy(task.blockedBy || []);
      setSuggestedSubtasks([]);
      setCommentSummary('');
    } else {
      setTitle('');
      setDescription('');
      setStatus(TaskStatus.TODO);
      setPriority(TaskPriority.MEDIUM);
      setDueDate(new Date().toISOString().split('T')[0]);
      setTags([]);
      setEstimatedTime('');
      setBlockedBy([]);
      setSuggestedSubtasks([]);
      setCommentSummary('');
    }
    setNewComment('');
    setTagInput('');
  }, [task, isOpen]);

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
      tags,
      estimatedTime: estimatedTime === '' ? undefined : Number(estimatedTime),
      blockedBy
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

  const handleSummarizeComments = async () => {
    if (!task?.comments?.length) return;
    setIsSummarizing(true);
    const summary = await summarizeComments(task.comments);
    setCommentSummary(summary);
    setIsSummarizing(false);
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

  const handleShare = () => {
      const url = `https://taskflow.app/task/${task?.id || '123'}`;
      navigator.clipboard.writeText(url);
      alert('Public link copied to clipboard!');
  };

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

  const handleReaction = (commentId: string, emoji: string) => {
      if (task && onAddReaction) {
          onAddReaction(task.id, commentId, emoji);
      }
  };

  // Feature 2: Voice Logic
  const toggleVoice = () => {
    if (!('webkitSpeechRecognition' in window)) {
        alert("Speech recognition not supported in this browser.");
        return;
    }

    if (isListening) {
        setIsListening(false);
        // Logic to stop handled by browser mostly, we just update UI state
    } else {
        setIsListening(true);
        const recognition = new (window as any).webkitSpeechRecognition();
        recognition.lang = 'en-US';
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setDescription(prev => prev + (prev ? ' ' : '') + transcript);
            setIsListening(false);
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognition.start();
    }
  };

  // Feature 10: Rich Text Toolbar Helper
  const insertText = (before: string, after: string = '') => {
      const textarea = document.getElementById('desc-editor') as HTMLTextAreaElement;
      if (!textarea) return;
      
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const beforeText = text.substring(0, start);
      const afterText = text.substring(end, text.length);
      const selection = text.substring(start, end);
      
      setDescription(beforeText + before + selection + after + afterText);
      textarea.focus();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-6">
      <div 
        className="fixed inset-0 bg-gray-900 bg-opacity-40 dark:bg-opacity-80 transition-opacity backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="bg-white dark:bg-gray-800 sm:rounded-xl shadow-2xl w-full h-full sm:h-auto sm:max-w-2xl transform transition-all flex flex-col sm:max-h-[90vh] z-10 border border-gray-100 dark:border-gray-700">
        
        <div className="flex justify-between items-center px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-700 shrink-0">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {task ? 'Edit Task' : 'New Task'}
          </h2>
          <div className="flex items-center space-x-2">
            {task && (
                <button 
                  onClick={handleShare}
                  className="p-1 rounded text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-gray-700 dark:hover:text-primary-400 transition-colors"
                  title="Share Public Link"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                </button>
            )}
            {task && onDuplicate && (
               <button 
                 onClick={() => onDuplicate(task)}
                 className="p-1 rounded text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-gray-700 dark:hover:text-primary-400 transition-colors"
                 title="Duplicate Task"
               >
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
               </button>
            )}
            <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-200 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar space-y-6 flex-1">
          
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm text-gray-600 dark:text-gray-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Est. Time (Hours)</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 4.5"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm text-gray-600 dark:text-gray-300 placeholder-gray-400"
              />
            </div>
          </div>
          
          {/* Feature 5: Task Dependencies */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Blocked By</label>
            <select
              value=""
              onChange={(e) => {
                 if(e.target.value && !blockedBy.includes(e.target.value)) {
                    setBlockedBy([...blockedBy, e.target.value]);
                 }
              }}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm text-gray-900 dark:text-white"
            >
              <option value="">Add Blocking Task...</option>
              {allTasks.filter(t => t.id !== task?.id).map(t => (
                 <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
            <div className="flex flex-wrap gap-2 mt-2">
               {blockedBy.map(id => {
                  const blocker = allTasks.find(t => t.id === id);
                  return (
                    <span key={id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300">
                      Blocked by: {blocker?.title || 'Unknown'}
                      <button onClick={() => setBlockedBy(blockedBy.filter(bid => bid !== id))} className="ml-1 hover:text-red-900">×</button>
                    </span>
                  );
               })}
            </div>
          </div>

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

          <div className="relative">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
              <div className="flex items-center space-x-3">
                  {/* Feature 10: Rich Text Toolbar */}
                  <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded p-1">
                      <button onClick={() => insertText('**', '**')} className="px-2 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 rounded" title="Bold">B</button>
                      <button onClick={() => insertText('*', '*')} className="px-2 text-xs italic text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 rounded" title="Italic">I</button>
                      <button onClick={() => insertText('- ')} className="px-2 text-xs text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 rounded" title="List">List</button>
                      <button onClick={() => insertText('- [ ] ')} className="px-2 text-xs text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 rounded" title="Checklist">✓</button>
                  </div>

                  {/* Feature 2: Voice Input */}
                  <button onClick={toggleVoice} className={`p-1 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`} title="Dictate Description">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                  </button>

                  <button 
                    type="button"
                    onClick={handleAiEnhance}
                    disabled={isAiLoading || !title}
                    className="flex items-center text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 disabled:opacity-50 transition-colors"
                  >
                    {isAiLoading ? 'Thinking...' : 'AI Enhance'}
                  </button>
              </div>
            </div>
            <textarea
              id="desc-editor"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow outline-none text-sm text-gray-700 dark:text-gray-300 resize-none bg-gray-50 dark:bg-gray-700"
              placeholder="Describe details..."
            />
            {suggestedSubtasks.length > 0 && (
                <div className="mt-3 bg-purple-50 dark:bg-purple-900/20 p-3 rounded-md border border-purple-100 dark:border-purple-800">
                    <p className="text-xs font-bold text-purple-800 dark:text-purple-300 mb-2">✨ AI Suggested Subtasks</p>
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

          {task && (
            <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
              <div className="flex justify-between items-center mb-3">
                 <h3 className="text-sm font-medium text-gray-900 dark:text-white">Activity & Comments</h3>
                 {task.comments && task.comments.length > 2 && (
                    <button 
                       onClick={handleSummarizeComments} 
                       disabled={isSummarizing}
                       className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"
                    >
                       {isSummarizing ? 'Summarizing...' : 'Summarize Thread'}
                    </button>
                 )}
              </div>
              
              {commentSummary && (
                <div className="mb-3 p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-xs text-indigo-800 dark:text-indigo-200 border border-indigo-100 dark:border-indigo-800">
                   <strong>AI Summary:</strong> {commentSummary}
                </div>
              )}
              
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 sm:p-4 mb-3 max-h-48 overflow-y-auto custom-scrollbar">
                {!task.comments || task.comments.length === 0 ? (
                  <p className="text-center text-xs text-gray-400 dark:text-gray-500 py-2">No comments yet.</p>
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
                           
                           <div className="flex space-x-2 mt-1">
                               <button onClick={() => handleReaction(comment.id, '👍')} className="text-xs text-gray-400 hover:text-blue-500 transition-colors">👍</button>
                               <button onClick={() => handleReaction(comment.id, '❤️')} className="text-xs text-gray-400 hover:text-red-500 transition-colors">❤️</button>
                               <button onClick={() => handleReaction(comment.id, '🔥')} className="text-xs text-gray-400 hover:text-orange-500 transition-colors">🔥</button>
                               
                               {comment.reactions && Object.entries(comment.reactions).map(([emoji, reaction]) => (
                                   <span key={emoji} className="text-[10px] bg-white dark:bg-gray-600 border border-gray-100 dark:border-gray-500 px-1 rounded-full flex items-center">
                                       {emoji} {reaction.count}
                                   </span>
                               ))}
                           </div>
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

        <div className="px-4 sm:px-6 py-4 bg-gray-50 dark:bg-gray-750 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center sm:rounded-b-xl shrink-0 safe-pb-4">
          {task && onDelete ? (
             <Button 
                variant="danger" 
                size="sm" 
                onClick={() => {
                  if(window.confirm('Move this task to trash?')) {
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
