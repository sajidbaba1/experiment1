import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import TaskBoard from './components/TaskBoard';
import TaskModal from './components/TaskModal';
import { Task, TaskStatus, TaskPriority } from './types';

// Mock Data
const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    title: 'Design System Audit',
    description: 'Review the current color palette and typography scale for consistency across the marketing site.',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.HIGH,
    dueDate: '2023-11-15',
    assignee: 'Alex',
    tags: ['Design'],
    createdAt: Date.now(),
  },
  {
    id: '2',
    title: 'Implement Auth Flow',
    description: 'Integrate the new authentication API endpoints including JWT storage and refresh tokens.',
    status: TaskStatus.TODO,
    priority: TaskPriority.HIGH,
    dueDate: '2023-11-20',
    assignee: 'Sam',
    tags: ['Dev'],
    createdAt: Date.now(),
  },
  {
    id: '3',
    title: 'Update Documentation',
    description: 'Ensure the API docs reflect the latest breaking changes in v2.0.',
    status: TaskStatus.DONE,
    priority: TaskPriority.LOW,
    dueDate: '2023-11-01',
    assignee: 'Taylor',
    tags: ['Docs'],
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
    createdAt: Date.now(),
  },
];

function App() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | undefined>(undefined);

  // Load tasks from local storage on mount (optional enhancement, kept simple here with mock data fallback)
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

  // Save tasks whenever they change
  useEffect(() => {
    localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
  }, [tasks]);

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
        tags: [],
        assignee: 'You', // Mock assignee
      };
      setTasks(prev => [...prev, newTask]);
    }
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  return (
    <Layout onNewTask={handleCreateTask}>
      <TaskBoard tasks={tasks} onTaskClick={handleEditTask} />
      
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        task={currentTask}
      />
    </Layout>
  );
}

export default App;