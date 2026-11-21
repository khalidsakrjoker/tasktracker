export interface Project {
  id: number;
  name: string;
  code: string;
  color: string;
  icon: string;
  description?: string;
  status: string;
  totalTasks: number;
  openTasks: number;
  urgentTasks: number;
  completedTasks: number;
  totalClients: number;
}

export interface Client {
  id: number;
  name: string;
  phone?: string;
  company?: string;
  notes?: string;
  defaultProjectId?: number;
  defaultProject?: {
    id: number;
    name: string;
    code: string;
    color: string;
  };
  _count?: {
    tasks: number;
  };
}

export interface Task {
  id: number;
  title: string;
  details?: string;
  type: "bug" | "feature" | "tweak" | "support";
  priority: "P1" | "P2" | "P3";
  status: "backlog" | "today" | "in_progress" | "done";
  estimatedMinutes?: number;
  dueDate?: string;
  completedAt?: string;
  projectId: number;
  clientId?: number;
  project?: {
    id: number;
    name: string;
    code: string;
    color: string;
    icon: string;
  };
  client?: {
    id: number;
    name: string;
    phone?: string;
  };
  createdAt: string;
}

export interface TodayFocusData {
  p1Urgent: Task[];
  p2Features: Task[];
  p3Tweaks: Task[];
  stats: {
    urgentCount: number;
    todayCount: number;
    completedTodayCount: number;
  };
}
