import React, { useState, useEffect } from 'react';
import { SignedIn, SignedOut, SignIn, UserButton, useUser } from "@clerk/clerk-react";
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
import { api } from './services/api';
import { generateSprintTasks, autoAssignTasks } from './services/geminiService';

// Initial Rules for Automation (Frontend only for now)
// Initial Rules removed - loaded from backend

interface ToastMessage {
  message: string;
  type: 'success' | 'error' | 'info';
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [deletedTasks, setDeletedTasks] = useState<Task[]>([]); // Feature 3
  const [docs, setDocs] = useState<ProjectDoc[]>([]);
  const [automations, setAutomations] = useState<AutomationRule[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAutomationModalOpen, setIsAutomationModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false); // Feature 6
  const [currentTask, setCurrentTask] = useState<Task | undefined>(undefined);
  const [currentView, setCurrentView] = useState<ViewType>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Feature 4: Zen Mode
  const [zenMode, setZenMode] = useState(false);

  // Theme State
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

  // Load All Data from API
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tasksData, trashData, docsData, rulesData] = await Promise.all([
        api.getAllTasks(),
        api.getTrash(),
        api.getAllDocs(),
        api.getAllRules()
      ]);
      setTasks(tasksData);
      setDeletedTasks(trashData);
      setDocs(docsData);
      setAutomations(rulesData);
    } catch (e) {
      console.error("Failed to load data", e);
      showToast('Failed to load data. Is the backend running?', 'error');
    }
  };

  const loadTasks = async () => {
    const data = await api.getAllTasks();
    setTasks(data);
  };

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

  const handleSaveTask = async (taskData: Partial<Task>) => {
    try {
      if (taskData.id) {
        // Update existing
        const updatedTask = await api.updateTask(taskData.id, taskData);
        setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
        showToast('Task updated successfully');
      } else {
        // Create new
        const newTaskData = {
          ...taskData,
          status: taskData.status || TaskStatus.TODO,
          priority: taskData.priority || TaskPriority.MEDIUM,
          dueDate: taskData.dueDate || new Date().toISOString(),
          tags: taskData.tags || [],
          comments: [],
          assignee: taskData.assignee || 'You',
          estimatedTime: taskData.estimatedTime,
          blockedBy: taskData.blockedBy
        };
        const createdTask = await api.createTask(newTaskData);
        setTasks(prev => [...prev, createdTask]);
        showToast('New task created', 'success');
      }
      setIsModalOpen(false);
    } catch (e) {
      console.error("Failed to save task", e);
      showToast('Failed to save task', 'error');
    }
  };

  // Feature 3: Move to Trash (Soft Delete via API)
  const handleDeleteTask = async (id: string) => {
    if (window.confirm('Move task to recycle bin?')) {
      try {
        await api.deleteTask(id); // Soft delete
        // Refresh lists
        const [newTasks, newTrash] = await Promise.all([api.getAllTasks(), api.getTrash()]);
        setTasks(newTasks);
        setDeletedTasks(newTrash);
        showToast('Task moved to recycle bin', 'info');
        setIsModalOpen(false);
      } catch (e) {
        console.error("Failed to delete task", e);
        showToast('Failed to delete task', 'error');
      }
    }
  };

  // Feature 3: Trash Actions
  const handleRestoreTask = async (id: string) => {
    try {
      await api.restoreTask(id);
      // Refresh lists
      const [newTasks, newTrash] = await Promise.all([api.getAllTasks(), api.getTrash()]);
      setTasks(newTasks);
      setDeletedTasks(newTrash);
      showToast('Task restored');
    } catch (e) {
      console.error("Failed to restore task", e);
      showToast('Failed to restore task', 'error');
    }
  };

  const handlePermDeleteTask = async (id: string) => {
    if (window.confirm('This action cannot be undone. Delete forever?')) {
      try {
        await api.permanentDeleteTask(id);
        setDeletedTasks(prev => prev.filter(t => t.id !== id));
        showToast('Task permanently deleted');
      } catch (e) {
        console.error("Failed to delete task permanently", e);
        showToast('Failed to delete task', 'error');
      }
    }
  };

  const handleEmptyTrash = async () => {
    if (window.confirm('Empty recycle bin? This cannot be undone.')) {
      try {
        // Delete all individually for now (could add bulk delete API)
        await Promise.all(deletedTasks.map(t => api.permanentDeleteTask(t.id)));
        setDeletedTasks([]);
        showToast('Recycle bin emptied');
      } catch (e) {
        console.error("Failed to empty trash", e);
        showToast('Failed to empty trash', 'error');
      }
    }
  };

  const handleTaskMove = async (taskId: string, newStatus: TaskStatus) => {
    let task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // 1. Apply status change locally first (Optimistic)
    let updatedTask = { ...task, status: newStatus };

    // 2. Run Automations
    const { updatedTask: automatedTask, triggered } = runAutomations(updatedTask);

    // 3. Update State
    setTasks(prev => prev.map(t => t.id === taskId ? automatedTask : t));

    // 4. Persist to Backend
    try {
      await api.updateTask(taskId, automatedTask);

      if (newStatus === TaskStatus.DONE) {
        showToast('Task completed! 🎉', 'success');
      }
    } catch (e) {
      console.error("Failed to move task", e);
      showToast('Failed to move task', 'error');
      loadTasks(); // Revert on error
    }
  };

  const handleAddComment = async (taskId: string, text: string) => {
    const newComment: Comment = {
      id: Date.now().toString(),
      text,
      author: 'You',
      createdAt: Date.now(),
      reactions: {}
    };

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedTask = {
      ...task,
      comments: [...(task.comments || []), newComment]
    };

    // Optimistic Update
    setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
    if (currentTask && currentTask.id === taskId) {
      setCurrentTask(updatedTask);
    }

    // Persist
    try {
      await api.updateTask(taskId, updatedTask);
    } catch (e) {
      console.error("Failed to add comment", e);
      showToast("Failed to save comment", 'error');
    }
  };

  const handleAddReaction = async (taskId: string, commentId: string, emoji: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.comments) return;

    const updatedComments = task.comments.map(c => {
      if (c.id !== commentId) return c;

      const currentReactions = c.reactions || {};
      const existing = currentReactions[emoji] || { count: 0, userReacted: false, emoji };

      return {
        ...c,
        reactions: {
          ...currentReactions,
          [emoji]: {
            ...existing,
            count: existing.count + 1,
            userReacted: true
          }
        }
      };
    });

    const updatedTask = { ...task, comments: updatedComments };

    // Optimistic Update
    setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
    if (currentTask && currentTask.id === taskId) {
      setCurrentTask(updatedTask);
    }

    // Persist
    try {
      await api.updateTask(taskId, updatedTask);
    } catch (e) {
      console.error("Failed to add reaction", e);
    }
  };

  const handleDuplicateTask = async (task: Task) => {
    try {
      const newTaskData = {
        ...task,
        id: undefined, // Let backend assign ID
        title: `${task.title} (Copy)`,
        createdAt: Date.now(),
        comments: [], // Don't copy comments
      };
      const createdTask = await api.createTask(newTaskData);
      setTasks(prev => [...prev, createdTask]);
      showToast('Task duplicated');
      setIsModalOpen(false);
    } catch (e) {
      console.error("Failed to duplicate task", e);
      showToast('Failed to duplicate task', 'error');
    }
  };

  const handleClearDoneTasks = async () => {
    if (window.confirm('Are you sure you want to remove all completed tasks?')) {
      try {
        const doneTasks = tasks.filter(t => t.status === TaskStatus.DONE);
        await Promise.all(doneTasks.map(t => api.deleteTask(t.id)));
        setTasks(prev => prev.filter(t => t.status !== TaskStatus.DONE));
        showToast('Completed tasks cleared', 'info');
      } catch (e) {
        console.error("Failed to clear completed tasks", e);
        showToast('Failed to clear completed tasks', 'error');
      }
    }
  };

  // --- Docs Handlers (API) ---
  const handleSaveDoc = async (doc: ProjectDoc) => {
    try {
      if (docs.find(d => d.id === doc.id)) {
        const updated = await api.updateDoc(doc.id, doc);
        setDocs(prev => prev.map(d => d.id === doc.id ? updated : d));
        showToast('Document saved');
      } else {
        const created = await api.createDoc(doc);
        setDocs(prev => [...prev, created]);
        showToast('New document created');
      }
    } catch (e) {
      console.error("Failed to save doc", e);
      showToast('Failed to save document', 'error');
    }
  };

  const handleDeleteDoc = async (id: string) => {
    if (window.confirm('Delete this document?')) {
      try {
        await api.deleteDoc(id);
        setDocs(prev => prev.filter(d => d.id !== id));
        showToast('Document deleted');
      } catch (e) {
        console.error("Failed to delete doc", e);
        showToast('Failed to delete document', 'error');
      }
    }
  };

  // --- Automation Handlers (API) ---
  const handleAddRule = async (rule: AutomationRule) => {
    try {
      const created = await api.createRule(rule);
      setAutomations(prev => [...prev, created]);
      showToast('Automation rule created');
    } catch (e) {
      console.error("Failed to create rule", e);
      showToast('Failed to create rule', 'error');
    }
  };

  const handleDeleteRule = async (id: string) => {
    try {
      await api.deleteRule(id);
      setAutomations(prev => prev.filter(r => r.id !== id));
    } catch (e) {
      console.error("Failed to delete rule", e);
      showToast('Failed to delete rule', 'error');
    }
  };

  const handleToggleRule = async (id: string) => {
    const rule = automations.find(r => r.id === id);
    if (!rule) return;
    try {
      const updated = await api.updateRule(id, { ...rule, isActive: !rule.isActive });
      setAutomations(prev => prev.map(r => r.id === id ? updated : r));
    } catch (e) {
      console.error("Failed to toggle rule", e);
      showToast('Failed to toggle rule', 'error');
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Title', 'Description', 'Status', 'Priority', 'Due Date', 'Assignee', 'Estimated Time', 'Created At'];
    const rows = tasks.map(t => [
      t.id,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      t.status,
      t.priority,
      t.dueDate,
      t.assignee || '',
      t.estimatedTime || '',
      new Date(t.createdAt).toISOString()
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `taskflow_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Tasks exported to CSV');
  };

  const handleQuickAddTask = async (title: string, status: TaskStatus) => {
    try {
      const newTaskData = {
        title,
        status,
        priority: TaskPriority.MEDIUM,
        dueDate: new Date().toISOString(),
        tags: [],
        comments: [],
        assignee: 'You',
      };
      const createdTask = await api.createTask(newTaskData);
      setTasks(prev => [...prev, createdTask]);
      showToast('Task added quickly', 'success');
    } catch (e) {
      console.error("Failed to quick add task", e);
      showToast('Failed to quick add task', 'error');
    }
  };

  const handleGenerateSprint = async () => {
    const goal = prompt("What is the goal of this sprint? (e.g., 'Build the user dashboard')");
    if (!goal) return;
    showToast("AI is generating your sprint plan...", 'info');

    const users = Array.from(new Set(tasks.map(t => t.assignee).filter(Boolean))) as string[];
    const generatedTasks = await generateSprintTasks(goal, users.length ? users : ['Alex', 'Sam', 'Taylor']);
    if (generatedTasks.length > 0) {
      try {
        const createdTasks = await Promise.all(generatedTasks.map(t => api.createTask({
          ...t,
          status: TaskStatus.TODO,
          priority: t.priority || TaskPriority.MEDIUM,
          dueDate: new Date().toISOString(),
          tags: t.tags || [],
          comments: [],
          assignee: t.assignee || 'You'
        })));

        setTasks(prev => [...prev, ...createdTasks]);
        showToast(`Generated ${createdTasks.length} tasks for your sprint!`, 'success');
      } catch (e) {
        console.error("Failed to save generated sprint tasks", e);
        showToast("Failed to save generated tasks.", 'error');
      }
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
    try {
      const updates = [];
      for (const taskId in assignments) {
        const assignee = assignments[taskId];
        const task = tasks.find(t => t.id === taskId);
        if (task) {
          updates.push(api.updateTask(taskId, { ...task, assignee }));
          count++;
        }
      }
      await Promise.all(updates);
      loadTasks();

      if (count > 0) {
        showToast(`Auto-assigned ${count} tasks.`, 'success');
      } else {
        showToast("Could not assign tasks.", 'error');
      }
    } catch (e) {
      console.error("Failed to auto-assign tasks", e);
      showToast("Failed to update task assignments.", 'error');
    }
  };

  return (
    <>
      <SignedOut>
        <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl">
            <h1 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white">TaskFlow</h1>
            <SignIn />
          </div>
        </div>
      </SignedOut>
      <SignedIn>
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
      </SignedIn>
    </>
  );
}

export default App;
