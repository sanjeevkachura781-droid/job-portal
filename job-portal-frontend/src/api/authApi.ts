import { api } from "./client";
import type { User } from "../types/api";
export const authApi = { register: (body: { name: string; email: string; password: string; role: "candidate" | "recruiter" }) => api.post<{ user: User; token: string }>("/auth/register", body), login: (body: { email: string; password: string }) => api.post<{ user: User; token: string }>("/auth/login", body), me: () => api.get<{ user: User }>("/auth/me"), updateProfile: (body: { name?: string; email?: string }) => api.patch<{ user: User }>("/auth/profile", body) };
