
import React, { useState, useEffect } from 'react';
import Layout, { ViewType } from './components/Layout';
import TaskBoard from './components/TaskBoard';
import TaskList from './components/TaskList';
import Reports from './components/Reports';
import TaskModal from './components/TaskModal';
import Toast from './components/Toast';
import TimelineView from './components/TimelineView';
import DocsView from './components/DocsView';
import TrashView from './components/TrashView'; // Feature 3
import ShortcutsModal from './components/ShortcutsModal'; // Feature 6
import AutomationModal from './components/AutomationModal';
import { Task, TaskStatus, TaskPriority, Comment, AutomationRule, ProjectDoc } from './types';
import { generateSprintTasks, autoAssignTasks } from './services/geminiService';

// Mock Data
const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    title: 'Design System Audit',
    description: 'Review the current color palette and typography scale.\n\n- [x] Colors\n- [x] Typography\n- [ ] Spacing',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.HIGH,
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    assignee: 'Alex',
    tags: ['Design', 'Audit'],
    comments: [
      { id: 'c1', text: 'I found some inconsistencies in the mobile view.', author: 'Sam', createdAt: Date.now() - 10000000 }
    ],
    createdAt: Date.now() - 86400000 * 5,
    estimatedTime: 4,
  },
  {
    id: '2',
    title: 'Implement Auth Flow',
    description: 'Integrate the new authentication API endpoints.\n\n- [ ] Login\n- [ ] Signup\n- [ ] Forgot Password',
    status: TaskStatus.TODO,
    priority: TaskPriority.HIGH,
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString(),
    assignee: 'Sam',
    tags: ['Dev', 'Backend'],
    comments: [],
    createdAt: Date.now() - 86400000 * 2,
    estimatedTime: 8,
  },
  {
    id: '3',
    title: 'Update Documentation',
    description: 'Ensure the API docs reflect the latest breaking changes.',
    status: TaskStatus.DONE,
    priority: TaskPriority.LOW,
    dueDate: new Date(Date.now() - 86400000).toISOString(),
    assignee: 'Taylor',
    tags: ['Docs'],
    comments: [],
    createdAt: Date.now() - 86400000 * 10,
    estimatedTime: 2,
  },
    {
    id: '4',
    title: 'Q4 Marketing Plan',
    description: 'Draft initial outline for Q4 social media campaigns.',
    status: TaskStatus.REVIEW,
    priority: TaskPriority.MEDIUM,
    dueDate: new Date(Date.now() + 86400000 * 10).toISOString(),
    assignee: 'Jordan',
    tags: ['Marketing'],
    comments: [],
    createdAt: Date.now() - 86400000 * 3,
    estimatedTime: 5,
  },
];

const INITIAL_RULES: AutomationRule[] = [
  {
    id: '1',
    name: 'Auto-Archive Done Tasks',
    triggerType: 'STATUS_CHANGE',
    triggerValue: TaskStatus.DONE,
    actionType: 'SET_PRIORITY',
    actionValue: TaskPriority.LOW,
    isActive: true
  }
];

interface ToastMessage {
  message: string;
  type: 'success' | 'error' | 'info';
}

function App() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [deletedTasks, setDeletedTasks] = useState<Task[]>([]); // Feature 3
  const [docs, setDocs] = useState<ProjectDoc[]>([]);
  const [automations, setAutomations] = useState<AutomationRule[]>(INITIAL_RULES);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAutomationModalOpen, setIsAutomationModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false); // Feature 6
  const [currentTask, setCurrentTask] = useState<Task | undefined>(undefined);
  const [currentView, setCurrentView] = useState<ViewType>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<ToastMessage | null>(null);
  
  // Feature 4: Zen Mode
  const [zenMode, setZenMode] = useState(false);
  
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('taskflow_dark_mode');
    return saved ? JSON.parse(saved) : false;
  });
  
  const [colorTheme, setColorTheme] = useState(() => {
    return localStorage.getItem('taskflow_color_theme') || 'blue';
  });

  useEffect(() => {
    localStorage.setItem('taskflow_dark_mode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('taskflow_color_theme', colorTheme);
    const themes = ['theme-blue', 'theme-purple', 'theme-green', 'theme-orange', 'theme-pink'];
    document.body.classList.remove(...themes);
    if (colorTheme !== 'blue') {
      document.body.classList.add(`theme-${colorTheme}`);
    }
  }, [colorTheme]);

  useEffect(() => {
     const savedTasks = localStorage.getItem('taskflow_tasks');
     if (savedTasks) setTasks(JSON.parse(savedTasks));

     const savedDeleted = localStorage.getItem('taskflow_deleted_tasks');
     if (savedDeleted) setDeletedTasks(JSON.parse(savedDeleted));

     const savedDocs = localStorage.getItem('taskflow_docs');
     if (savedDocs) setDocs(JSON.parse(savedDocs));

     const savedRules = localStorage.getItem('taskflow_automations');
     if (savedRules) setAutomations(JSON.parse(savedRules));
  }, []);

  useEffect(() => localStorage.setItem('taskflow_tasks', JSON.stringify(tasks)), [tasks]);
  useEffect(() => localStorage.setItem('taskflow_deleted_tasks', JSON.stringify(deletedTasks)), [deletedTasks]);
  useEffect(() => localStorage.setItem('taskflow_docs', JSON.stringify(docs)), [docs]);
  useEffect(() => localStorage.setItem('taskflow_automations', JSON.stringify(automations)), [automations]);

  // Feature 6: Global Keyboard Listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
       if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

       if (e.key === '?') {
         setIsShortcutsModalOpen(true);
       }
       if (e.key.toLowerCase() === 'n') {
         handleCreateTask();
       }
       if (e.key === '/') {
         e.preventDefault();
         const searchInput = document.querySelector('input[placeholder="Search tasks..."]') as HTMLInputElement;
         searchInput?.focus();
       }
       if (e.key === 'Escape') {
         setIsModalOpen(false);
         setIsAutomationModalOpen(false);
         setIsShortcutsModalOpen(false);
       }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  };

  const runAutomations = (task: Task) => {
    let updatedTask = { ...task };
    let triggered = false;

    automations.forEach(rule => {
      if (!rule.isActive) return;

      if (rule.triggerType === 'STATUS_CHANGE' && rule.triggerValue === task.status) {
        triggered = true;
        if (rule.actionType === 'SET_PRIORITY') {
           updatedTask.priority = rule.actionValue as TaskPriority;
           showToast(`Automation: Set priority to ${rule.actionValue}`, 'info');
        }
        if (rule.actionType === 'ASSIGN_USER') {
           updatedTask.assignee = rule.actionValue;
           showToast(`Automation: Assigned to ${rule.actionValue}`, 'info');
        }
      }
    });

    return { updatedTask, triggered };
  };

  const handleCreateTask = () => {
    setCurrentTask(undefined);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setCurrentTask(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = (taskData: Partial<Task>) => {
    if (taskData.id) {
      setTasks(prev => prev.map(t => t.id === taskData.id ? { ...t, ...taskData } as Task : t));
      showToast('Task updated successfully');
    } else {
      const newTask: Task = {
        id: Date.now().toString(),
        createdAt: Date.now(),
        title: taskData.title || 'Untitled',
        description: taskData.description || '',
        status: taskData.status || TaskStatus.TODO,
        priority: taskData.priority || TaskPriority.MEDIUM,
        dueDate: taskData.dueDate || new Date().toISOString(),
        tags: taskData.tags || [],
        comments: [],
        assignee: taskData.assignee || 'You', 
        estimatedTime: taskData.estimatedTime,
        blockedBy: taskData.blockedBy
      };
      setTasks(prev => [...prev, newTask]);
      showToast('New task created', 'success');
    }
  };

  // Feature 3: Move to Trash
  const handleDeleteTask = (id: string) => {
    const taskToDelete = tasks.find(t => t.id === id);
    if (taskToDelete) {
       setDeletedTasks(prev => [taskToDelete, ...prev]);
       setTasks(prev => prev.filter(t => t.id !== id));
       showToast('Task moved to recycle bin', 'info');
    }
  };

  // Feature 3: Trash Actions
  const handleRestoreTask = (id: string) => {
     const task = deletedTasks.find(t => t.id === id);
     if (task) {
        setTasks(prev => [...prev, task]);
        setDeletedTasks(prev => prev.filter(t => t.id !== id));
        showToast('Task restored');
     }
  };

  const handlePermDeleteTask = (id: string) => {
     if(window.confirm('This action cannot be undone. Delete forever?')) {
        setDeletedTasks(prev => prev.filter(t => t.id !== id));
        showToast('Task permanently deleted');
     }
  };

  const handleEmptyTrash = () => {
     if(window.confirm('Empty recycle bin?')) {
        setDeletedTasks([]);
        showToast('Recycle bin emptied');
     }
  };

  const handleTaskMove = (taskId: string, newStatus: TaskStatus) => {
    let task = tasks.find(t => t.id === taskId);
    if (!task) return;

    let updatedTask = { ...task, status: newStatus };
    const { updatedTask: automatedTask, triggered } = runAutomations(updatedTask);

    setTasks(prev => prev.map(t => t.id === taskId ? automatedTask : t));
    
    if (newStatus === TaskStatus.DONE) {
      showToast('Task completed! 🎉', 'success');
    }
  };

  const handleAddComment = (taskId: string, text: string) => {
    const newComment: Comment = {
      id: Date.now().toString(),
      text,
      author: 'You',
      createdAt: Date.now(),
      reactions: {}
    };

    const updateTaskWithComment = (task: Task) => ({
      ...task,
      comments: [...(task.comments || []), newComment]
    });

    setTasks(prev => prev.map(t => t.id === taskId ? updateTaskWithComment(t) : t));
    if (currentTask && currentTask.id === taskId) {
      setCurrentTask(prev => prev ? updateTaskWithComment(prev) : prev);
    }
  };

  const handleAddReaction = (taskId: string, commentId: string, emoji: string) => {
     setTasks(prev => prev.map(t => {
        if (t.id !== taskId || !t.comments) return t;
        const updatedComments = t.comments.map(c => {
           if (c.id !== commentId) return c;
           const currentReactions = c.reactions || {};
           const existing = currentReactions[emoji] || { count: 0, userReacted: false, emoji };
           return {
              ...c,
              reactions: {
                 ...currentReactions,
                 [emoji]: { ...existing, count: existing.count + 1, userReacted: true }
              }
           };
        });
        if (currentTask && currentTask.id === taskId) {
           setCurrentTask({ ...t, comments: updatedComments });
        }
        return { ...t, comments: updatedComments };
     }));
  };

  const handleDuplicateTask = (task: Task) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      title: `${task.title} (Copy)`,
      createdAt: Date.now(),
      comments: [],
    };
    setTasks(prev => [...prev, newTask]);
    showToast('Task duplicated');
    setIsModalOpen(false);
  };

  const handleClearDoneTasks = () => {
    if (window.confirm('Are you sure you want to move all completed tasks to trash?')) {
      const doneTasks = tasks.filter(t => t.status === TaskStatus.DONE);
      setDeletedTasks(prev => [...prev, ...doneTasks]);
      setTasks(prev => prev.filter(t => t.status !== TaskStatus.DONE));
      showToast('Completed tasks moved to trash', 'info');
    }
  };

  const handleSaveDoc = (doc: ProjectDoc) => {
     if (docs.find(d => d.id === doc.id)) {
        setDocs(prev => prev.map(d => d.id === doc.id ? doc : d));
        showToast('Document saved');
     } else {
        setDocs(prev => [...prev, doc]);
        showToast('New document created');
     }
  };

  const handleDeleteDoc = (id: string) => {
     if(window.confirm('Delete this document?')) {
        setDocs(prev => prev.filter(d => d.id !== id));
        showToast('Document deleted');
     }
  };

  const handleAddRule = (rule: AutomationRule) => {
    setAutomations(prev => [...prev, rule]);
    showToast('Automation rule created');
  };

  const handleDeleteRule = (id: string) => {
    setAutomations(prev => prev.filter(r => r.id !== id));
  };

  const handleToggleRule = (id: string) => {
    setAutomations(prev => prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Title', 'Description', 'Status', 'Priority', 'Due Date', 'Assignee', 'Estimated Time', 'Created At'];
    const rows = tasks.map(t => [
      t.id,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.description.replace(/"/g, '""')}"`,
      t.status,
      t.priority,
      t.dueDate,
      t.assignee || '',
      t.estimatedTime || '',
      new Date(t.createdAt).toISOString()
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `taskflow_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Tasks exported to CSV');
  };

  const handleQuickAddTask = (title: string, status: TaskStatus) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      description: '',
      status,
      priority: TaskPriority.MEDIUM,
      dueDate: '',
      tags: [],
      comments: [],
      createdAt: Date.now(),
      assignee: 'You',
    };
    setTasks(prev => [...prev, newTask]);
    showToast('Task added quickly', 'success');
  };

  const handleGenerateSprint = async () => {
    const goal = prompt("What is the goal of this sprint? (e.g., 'Build the user dashboard')");
    if (!goal) return;
    showToast("AI is generating your sprint plan...", 'info');
    const users = Array.from(new Set(tasks.map(t => t.assignee).filter(Boolean))) as string[];
    const generatedTasks = await generateSprintTasks(goal, users.length ? users : ['Alex', 'Sam', 'Taylor']);
    if (generatedTasks.length > 0) {
      const newTasks = generatedTasks.map((t, index) => ({
        ...t,
        id: (Date.now() + index).toString(),
        createdAt: Date.now(),
        comments: [],
        dueDate: new Date().toISOString()
      } as Task));
      setTasks(prev => [...prev, ...newTasks]);
      showToast(`Generated ${newTasks.length} tasks for your sprint!`, 'success');
    } else {
      showToast("Could not generate sprint. Try again.", 'error');
    }
  };

  const handleAutoAssign = async () => {
    const unassigned = tasks.filter(t => !t.assignee || t.assignee === 'Unassigned' || t.assignee === 'You');
    if (unassigned.length === 0) {
      showToast("No unassigned tasks found.", 'info');
      return;
    }
    showToast("AI is assigning tasks...", 'info');
    const users = Array.from(new Set(tasks.map(t => t.assignee).filter(a => a && a !== 'Unassigned' && a !== 'You'))) as string[];
    const availableUsers = users.length > 0 ? users : ['Alex', 'Sam', 'Taylor', 'Jordan'];
    const assignments = await autoAssignTasks(unassigned, availableUsers);
    let count = 0;
    setTasks(prev => prev.map(t => {
      if (assignments[t.id]) {
        count++;
        return { ...t, assignee: assignments[t.id] };
      }
      return t;
    }));
    if (count > 0) {
      showToast(`Auto-assigned ${count} tasks.`, 'success');
    } else {
      showToast("Could not assign tasks.", 'error');
    }
  };

  return (
    <Layout 
      onNewTask={handleCreateTask}
      darkMode={darkMode}
      toggleDarkMode={() => setDarkMode(!darkMode)}
      colorTheme={colorTheme}
      setColorTheme={setColorTheme}
      currentView={currentView}
      onViewChange={setCurrentView}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onExportCSV={handleExportCSV}
      onGenerateSprint={handleGenerateSprint}
      onOpenAutomations={() => setIsAutomationModalOpen(true)}
      onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
      tasks={tasks}
      zenMode={zenMode}
      toggleZenMode={() => setZenMode(!zenMode)}
    >
      {currentView === 'board' && (
        <TaskBoard 
          tasks={tasks} 
          onTaskClick={handleEditTask} 
          onTaskMove={handleTaskMove}
          searchQuery={searchQuery}
          onQuickAddTask={handleQuickAddTask}
          onClearDoneTasks={handleClearDoneTasks}
          onAutoAssign={handleAutoAssign}
        />
      )}
      
      {currentView === 'list' && (
        <TaskList 
          tasks={tasks}
          onTaskClick={handleEditTask}
          searchQuery={searchQuery}
        />
      )}

      {currentView === 'my-tasks' && (
        <TaskList 
          tasks={tasks.filter(t => t.assignee === 'You' || t.assignee === 'Unassigned')}
          onTaskClick={handleEditTask}
          searchQuery={searchQuery}
        />
      )}

      {currentView === 'timeline' && (
        <TimelineView 
          tasks={tasks}
          onTaskClick={handleEditTask}
        />
      )}

      {currentView === 'docs' && (
        <DocsView 
          docs={docs}
          onSaveDoc={handleSaveDoc}
          onDeleteDoc={handleDeleteDoc}
        />
      )}

      {currentView === 'reports' && (
        <Reports tasks={tasks} />
      )}

      {currentView === 'trash' && (
         <TrashView 
           deletedTasks={deletedTasks}
           onRestore={handleRestoreTask}
           onPermDelete={handlePermDeleteTask}
           onEmptyTrash={handleEmptyTrash}
         />
      )}
      
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        onDuplicate={handleDuplicateTask}
        onAddComment={handleAddComment}
        onAddReaction={handleAddReaction}
        task={currentTask}
        allTasks={tasks}
      />

      <AutomationModal
        isOpen={isAutomationModalOpen}
        onClose={() => setIsAutomationModalOpen(false)}
        rules={automations}
        onAddRule={handleAddRule}
        onDeleteRule={handleDeleteRule}
        onToggleRule={handleToggleRule}
      />

      <ShortcutsModal 
         isOpen={isShortcutsModalOpen}
         onClose={() => setIsShortcutsModalOpen(false)}
      />

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </Layout>
  );
}

export default App;
