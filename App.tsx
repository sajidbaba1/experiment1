import React, { useState, useEffect } from 'react';
import Layout, { ViewType } from './components/Layout';
import TaskBoard from './components/TaskBoard';
import TaskList from './components/TaskList';
import Reports from './components/Reports';
import TaskModal from './components/TaskModal';
import Toast from './components/Toast';
import { Task, TaskStatus, TaskPriority, Comment } from './types';

// Mock Data
const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    title: 'Design System Audit',
    description: 'Review the current color palette and typography scale.\n\n- [x] Colors\n- [x] Typography\n- [ ] Spacing',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.HIGH,
    dueDate: '2023-11-15',
    assignee: 'Alex',
    tags: ['Design', 'Audit'],
    comments: [
      { id: 'c1', text: 'I found some inconsistencies in the mobile view.', author: 'Sam', createdAt: Date.now() - 10000000 }
    ],
    createdAt: Date.now(),
  },
  {
    id: '2',
    title: 'Implement Auth Flow',
    description: 'Integrate the new authentication API endpoints.\n\n- [ ] Login\n- [ ] Signup\n- [ ] Forgot Password',
    status: TaskStatus.TODO,
    priority: TaskPriority.HIGH,
    dueDate: '2023-11-20',
    assignee: 'Sam',
    tags: ['Dev', 'Backend'],
    comments: [],
    createdAt: Date.now(),
  },
  {
    id: '3',
    title: 'Update Documentation',
    description: 'Ensure the API docs reflect the latest breaking changes.',
    status: TaskStatus.DONE,
    priority: TaskPriority.LOW,
    dueDate: '2023-11-01',
    assignee: 'Taylor',
    tags: ['Docs'],
    comments: [],
    createdAt: Date.now(),
  },
    {
    id: '4',
    title: 'Q4 Marketing Plan',
    description: 'Draft initial outline for Q4 social media campaigns.',
    status: TaskStatus.REVIEW,
    priority: TaskPriority.MEDIUM,
    dueDate: '2023-11-10',
    assignee: 'Jordan',
    tags: ['Marketing'],
    comments: [],
    createdAt: Date.now(),
  },
];

interface ToastMessage {
  message: string;
  type: 'success' | 'error' | 'info';
}

function App() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | undefined>(undefined);
  const [currentView, setCurrentView] = useState<ViewType>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<ToastMessage | null>(null);
  
  // Theme State
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('taskflow_dark_mode');
    return saved ? JSON.parse(saved) : false;
  });
  
  const [colorTheme, setColorTheme] = useState(() => {
    return localStorage.getItem('taskflow_color_theme') || 'blue';
  });

  // Apply Theme Effects
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

  // Load tasks from local storage
  useEffect(() => {
     const saved = localStorage.getItem('taskflow_tasks');
     if (saved) {
       try {
         setTasks(JSON.parse(saved));
       } catch (e) {
         console.error("Failed to load tasks", e);
       }
     }
  }, []);

  // Save tasks to local storage
  useEffect(() => {
    localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
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
      // Update existing
      setTasks(prev => prev.map(t => t.id === taskData.id ? { ...t, ...taskData } as Task : t));
      showToast('Task updated successfully');
    } else {
      // Create new
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
        assignee: 'You',
      };
      setTasks(prev => [...prev, newTask]);
      showToast('New task created', 'success');
    }
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    showToast('Task deleted', 'info');
  };

  const handleTaskMove = (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    
    if (newStatus === TaskStatus.DONE) {
      showToast('Task completed! 🎉', 'success');
    }
  };

  const handleAddComment = (taskId: string, text: string) => {
    const newComment: Comment = {
      id: Date.now().toString(),
      text,
      author: 'You',
      createdAt: Date.now()
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
    >
      {currentView === 'board' && (
        <TaskBoard 
          tasks={tasks} 
          onTaskClick={handleEditTask} 
          onTaskMove={handleTaskMove}
          searchQuery={searchQuery}
        />
      )}
      
      {currentView === 'list' && (
        <TaskList 
          tasks={tasks}
          onTaskClick={handleEditTask}
          searchQuery={searchQuery}
        />
      )}

      {currentView === 'reports' && (
        <Reports tasks={tasks} />
      )}
      
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        onAddComment={handleAddComment}
        task={currentTask}
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