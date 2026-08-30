import axios from "axios";
import axiosInstance from "../config/axios/axiosinstance";
import type { Project, Task, TaskPayload, User, UserPayload } from "../types";

export function apiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; errors?: Record<string, string[]> } | undefined;
    if (data?.errors) return Object.values(data.errors).flat().join(" ");
    if (data?.message) return data.message;
    if (!error.response) return "Impossible de joindre l’API. Vérifiez le serveur";
  }
  return error instanceof Error ? error.message : "Une erreur inattendue est survenue.";
}

export async function fetchTasks(): Promise<Task[]> {
  const { data } = await axiosInstance.get("/tasks");
  return data.tasks ?? [];
}

export async function createTask(payload: TaskPayload): Promise<Task> {
  const { data } = await axiosInstance.post("/tasks", payload);
  return data.task;
}

export async function updateTask(id: number, payload: Partial<TaskPayload>): Promise<Task> {
  const { data } = await axiosInstance.put(`/tasks/${id}`, payload);
  return data.task;
}

export async function deleteTask(id: number): Promise<void> {
  await axiosInstance.delete(`/tasks/${id}`);
}

export async function taskAction(id: number, action: "take" | "start" | "complete"): Promise<void> {
  await axiosInstance.request({ url: `/tasks/${id}/${action}`, method: action === "take" ? "post" : "put" });
}

export async function fetchUsers(): Promise<User[]> {
  const { data } = await axiosInstance.get("/users");
  return data.users ?? [];
}

export async function createUser(payload: UserPayload): Promise<User> {
  const { data } = await axiosInstance.post("/users", payload);
  return data.user;
}

export async function updateUser(id: number, payload: UserPayload): Promise<User> {
  const { data } = await axiosInstance.put(`/users/${id}`, payload);
  return data.user;
}

export async function deleteUser(id: number): Promise<void> {
  await axiosInstance.delete(`/users/${id}`);
}

export async function toggleUser(id: number, active: boolean): Promise<void> {
  await axiosInstance.patch(`/users/${id}/${active ? "enable" : "disable"}`);
}

export async function fetchProjects(): Promise<Project[]> {
  const { data } = await axiosInstance.get("/projects");
  return data.projects ?? [];
}

export async function createProject(payload: { name: string; description?: string; lead_developer_id?: number | null }): Promise<Project> {
  const { data } = await axiosInstance.post("/projects", payload);
  return data.project;
}

export async function deleteProject(id: number): Promise<void> {
  await axiosInstance.delete(`/projects/${id}`);
}

export async function logout(): Promise<void> {
  await axiosInstance.post("/logout");
}
