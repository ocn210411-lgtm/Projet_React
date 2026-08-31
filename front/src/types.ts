export type Role = "manager" | "lead_developer" | "developer";
export type TaskStatus = "pending" | "assigned" | "in_progress" | "completed" | "expired";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  is_active: boolean;
}

export interface Project {
  id: number;
  name: string;
  description?: string | null;
  lead_developer_id?: number | null;
  lead_developer?: User | null;
  members?: User[];
  tasks?: Task[];
}

export interface Task {
  id: number;
  title: string;
  description?: string | null;
  status: TaskStatus;
  project_id: number;
  assigned_to?: number | null;
  start_date?: string | null;
  assigned_at?: string | null;
  created_at?: string;
  project?: Project;
  developer?: User | null;
  creator?: User;
}

export interface TaskPayload {
  title: string;
  description?: string;
  project_id: number;
  assigned_to?: number | null;
  start_date?: string | null;
  status?: TaskStatus;
}

export interface GithubBranch {
  id: number;
  task_id: number;
  user_id: number;
  branch_name: string;
  github_url?: string | null;
}

export interface UserPayload {
  name: string;
  email: string;
  role: Exclude<Role, "manager">;
  password?: string;
}
