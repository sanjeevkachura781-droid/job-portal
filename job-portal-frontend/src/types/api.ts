export type Role = "candidate" | "recruiter" | "admin";
export type JobStatus = "draft" | "published" | "closed";
export type ApplicationStatus = "applied" | "shortlisted" | "interview" | "selected" | "rejected" | "withdrawn";
export type InterviewStatus = "scheduled" | "completed" | "cancelled" | "rescheduled";
export interface User { id: number; name: string; email: string; role: Role; isActive: boolean; createdAt: string; updatedAt: string; }
export interface Company { id: number; recruiterId: number; name: string; description: string | null; website: string | null; location: string | null; logoUrl: string | null; isApproved: boolean; createdAt: string; updatedAt: string; }
export interface Job { id: number; companyId: number; recruiterId: number; title: string; description: string; requirements: string | null; location: string | null; employmentType: string | null; experienceLevel: string | null; salaryMin: number | null; salaryMax: number | null; status: JobStatus; applicationDeadline: string | null; createdAt: string; updatedAt: string; company?: Company; }
export interface Application { id: number; jobId: number; candidateId: number; resumeUrl: string | null; coverLetter: string | null; status: ApplicationStatus; appliedAt: string; updatedAt: string; job?: Job; }
export interface Interview { id: number; applicationId: number; recruiterId: number; candidateId: number; scheduledAt: string; meetingLink: string | null; notes: string | null; status: InterviewStatus; }
export interface Notification { id: number; userId: number; title: string; message: string; type: string; isRead: boolean; createdAt: string; }
export interface CandidateProfile { id: number; userId: number; phone: string | null; location: string | null; bio: string | null; skills: string | null; experience: string | null; education: string | null; resumeUrl: string | null; }
export interface Pagination { page: number; limit: number; total: number; totalPages: number; }
