import { Task, ProjectDoc, AutomationRule, StickyNote } from '../types';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080') + '/api';
const TASKS_URL = `${API_BASE}/tasks`;
const DOCS_URL = `${API_BASE}/docs`;
const RULES_URL = `${API_BASE}/rules`;
const STICKY_URL = `${API_BASE}/sticky`;

export const api = {
    // --- Tasks ---
    getAllTasks: async (): Promise<Task[]> => {
        const response = await fetch(TASKS_URL);
        if (!response.ok) throw new Error('Failed to fetch tasks');
        return response.json();
    },

    getTrash: async (): Promise<Task[]> => {
        const response = await fetch(`${TASKS_URL}/trash`);
        if (!response.ok) throw new Error('Failed to fetch trash');
        return response.json();
    },

    createTask: async (task: Partial<Task>): Promise<Task> => {
        const response = await fetch(TASKS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task),
        });
        if (!response.ok) throw new Error('Failed to create task');
        return response.json();
    },

    updateTask: async (id: string, task: Partial<Task>): Promise<Task> => {
        const response = await fetch(`${TASKS_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task),
        });
        if (!response.ok) throw new Error('Failed to update task');
        return response.json();
    },

    deleteTask: async (id: string): Promise<void> => {
        const response = await fetch(`${TASKS_URL}/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete task');
    },

    restoreTask: async (id: string): Promise<Task> => {
        const response = await fetch(`${TASKS_URL}/${id}/restore`, {
            method: 'PUT',
        });
        if (!response.ok) throw new Error('Failed to restore task');
        return response.json();
    },

    permanentDeleteTask: async (id: string): Promise<void> => {
        const response = await fetch(`${TASKS_URL}/${id}/permanent`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to permanently delete task');
    },

    // --- Docs ---
    getAllDocs: async (): Promise<ProjectDoc[]> => {
        const response = await fetch(DOCS_URL);
        if (!response.ok) throw new Error('Failed to fetch docs');
        return response.json();
    },

    createDoc: async (doc: ProjectDoc): Promise<ProjectDoc> => {
        const response = await fetch(DOCS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(doc),
        });
        if (!response.ok) throw new Error('Failed to create doc');
        return response.json();
    },

    updateDoc: async (id: string, doc: ProjectDoc): Promise<ProjectDoc> => {
        const response = await fetch(`${DOCS_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(doc),
        });
        if (!response.ok) throw new Error('Failed to update doc');
        return response.json();
    },

    deleteDoc: async (id: string): Promise<void> => {
        const response = await fetch(`${DOCS_URL}/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete doc');
    },

    // --- Automation Rules ---
    getAllRules: async (): Promise<AutomationRule[]> => {
        const response = await fetch(RULES_URL);
        if (!response.ok) throw new Error('Failed to fetch rules');
        return response.json();
    },

    createRule: async (rule: AutomationRule): Promise<AutomationRule> => {
        const response = await fetch(RULES_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(rule),
        });
        if (!response.ok) throw new Error('Failed to create rule');
        return response.json();
    },

    updateRule: async (id: string, rule: AutomationRule): Promise<AutomationRule> => {
        const response = await fetch(`${RULES_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(rule),
        });
        if (!response.ok) throw new Error('Failed to update rule');
        return response.json();
    },

    deleteRule: async (id: string): Promise<void> => {
        const response = await fetch(`${RULES_URL}/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete rule');
    },

    // --- Sticky Note ---
    getStickyNote: async (): Promise<StickyNote> => {
        const response = await fetch(STICKY_URL);
        if (!response.ok) throw new Error('Failed to fetch sticky note');
        return response.json();
    },

    updateStickyNote: async (note: StickyNote): Promise<StickyNote> => {
        const response = await fetch(STICKY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(note),
        });
        if (!response.ok) throw new Error('Failed to update sticky note');
        return response.json();
    },

    inviteMember: async (email: string): Promise<void> => {
        const response = await fetch(`${API_BASE}/invite`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        if (!response.ok) throw new Error('Failed to send invitation');
    },
};
