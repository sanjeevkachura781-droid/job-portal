import { api } from "./client";
export const userApi = { updateCandidateProfile: (body: Record<string, string>) => api.patch("/users/profile", body), uploadResume: (file: File) => { const data = new FormData(); data.append("resume", file); return api.post<{ resumeUrl: string }>("/users/resume", data); } };
