
export enum TaskStatus {
  TODO = 'To Do',
  IN_PROGRESS = 'In Progress',
  REVIEW = 'Review',
  DONE = 'Done'
}

export enum TaskPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

export interface Reaction {
  emoji: string;
  count: number;
  userReacted: boolean;
}

export interface Comment {
  id: string;
  text: string;
  author: string;
  createdAt: number;
  reactions?: Record<string, Reaction>; // Key is emoji char
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  assignee?: string;
  tags: string[];
  comments?: Comment[];
  createdAt: number;
  estimatedTime?: number; 
}

export interface CreateTaskDTO {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  tags: string[];
}

// AI Specific Types
export interface AIChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface AssigneeRecommendation {
  taskId: string;
  suggestedAssignee: string;
  reason: string;
}

// Automation Types
export interface AutomationRule {
  id: string;
  name: string;
  triggerType: 'STATUS_CHANGE'; // Extendable later
  triggerValue: string; // e.g., 'Done'
  actionType: 'SET_PRIORITY' | 'ADD_COMMENT' | 'ASSIGN_USER';
  actionValue: string;
  isActive: boolean;
}

// Documentation Types
export interface ProjectDoc {
  id: string;
  title: string;
  content: string; // Markdown
  updatedAt: number;
}
