# Frontend API Mapping

Backend base URL: `http://localhost:5000`
API prefix: `/api`
Content type: JSON unless noted otherwise. Protected requests use `Authorization: Bearer <token>`.

## Shared conventions

- Success responses include `success: true` except register/login, which include `message`, `user`, and `token`.
- Error responses are `{ success: false, message: string }`.
- Authentication failures: `401` for missing/invalid/expired tokens or invalid credentials.
- Authorization failures: `403` for inactive accounts or disallowed roles.
- Validation failures: `400`. Unique conflicts and duplicate applications: `409`.
- There is no refresh-token endpoint. The frontend stores the access token and logs out on `401`; it must not attempt token refresh.
- Roles are exactly `candidate`, `recruiter`, and `admin`.
- Public uploads are served from `/uploads/...`.

## Health and root

### GET `/`
- Authentication: none.
- Response: `{ message: "Welcome to the Job Portal API" }`.
- Errors: standard `404` if unavailable.

### GET `/api/health`
- Authentication: none.
- Response: `{ success: true, message: "Job Portal API is running" }`.

## Authentication and user profile

### POST `/api/auth/register`
- Authentication: none.
- Body: `{ name: string, email: string, password: string, role?: "candidate" | "recruiter" }`.
- Query/params: none.
- Response `201`: `{ message: "Registration successful", user: User, token: string }`.
- Errors: `400` for invalid name/email/password; `409` if email is already registered.

### POST `/api/auth/login`
- Authentication: none.
- Body: `{ email: string, password: string }`.
- Query/params: none.
- Response `200`: `{ message: "Login successful", user: User, token: string }`.
- Errors: `400` for invalid input; `401` for invalid credentials; `403` for inactive account.

### GET `/api/auth/me`
- Authentication: required; any active role.
- Response: `{ success: true, user: User }`.
- Errors: `401`, `403`, or `404`.

### PATCH `/api/auth/profile`
- Authentication: required; any active role.
- Body: `{ name?: string, email?: string }`.
- Response: `{ success: true, user: User }`.
- Errors: `401`, `404`, `409` for duplicate email, or `500` for unexpected model errors.

`User` fields: `id`, `name`, `email`, `role`, `isActive`, `createdAt`, `updatedAt`. Password is never returned.

## Companies

### GET `/api/companies`
- Authentication: none.
- Response: `{ success: true, companies: Company[] }` containing approved companies only.

### GET `/api/companies/:id`
- Authentication: none.
- Params: `id`.
- Response: `{ success: true, company: Company }`.
- Errors: `404` if not found.

### POST `/api/companies`
- Authentication: required; role `recruiter`.
- Body: `{ name: string, description?: string, website?: string, location?: string, logoUrl?: string }`.
- Response `201`: `{ success: true, company: Company }`.
- Errors: `401`, `403`, `400`, or `409`.

### PATCH `/api/companies/:id`
- Authentication: required; role `recruiter`, and the recruiter must own the company.
- Params: `id`.
- Body: any company fields accepted by the model, normally `{ name?, description?, website?, location?, logoUrl? }`.
- Response: `{ success: true, company: Company }`.
- Errors: `401`, `403`, `404`, `400`, or `409`.

### DELETE `/api/companies/:id`
- Authentication: required; role `recruiter`, and the recruiter must own the company.
- Response: `204` with no body.
- Errors: `401`, `403`, `404`.

`Company` fields: `id`, `recruiterId`, `name`, `description`, `website`, `location`, `logoUrl`, `isApproved`, `createdAt`, `updatedAt`.

## Jobs

### GET `/api/jobs`
- Authentication: none.
- Query: `page`, `limit` (1-100); `keyword`; `location`; `employmentType`; `experienceLevel`; `minSalary`; `maxSalary`; `sortBy`; `sortOrder` (`ASC` or `DESC`).
- Response: `{ success: true, items: Job[], pagination: { page, limit, total, totalPages } }`.
- Only jobs with status `published` are returned.
- Errors: `500` for unexpected query/model errors.

### GET `/api/jobs/mine`
- Authentication: required; role `recruiter`.
- Response: `{ success: true, jobs: Job[] }` containing only jobs owned by the logged-in recruiter, including their company.
- Errors: `401` or `403`.

### GET `/api/jobs/:id`
- Authentication: none.
- Params: `id`.
- Response: `{ success: true, job: Job & { company?: Company } }`.
- Errors: `404` if not found.

### POST `/api/jobs`
- Authentication: required; role `recruiter`.
- Body: `{ companyId: number, title: string, description: string, requirements?: string, location?: string, employmentType?: string, experienceLevel?: string, salaryMin?: number, salaryMax?: number, status?: "draft" | "published" | "closed", applicationDeadline?: string }`.
- The backend sets `recruiterId` from the token.
- Response `201`: `{ success: true, job: Job }`.
- Errors: `401`, `403`, `400`, or `500`.

### PATCH `/api/jobs/:id`
- Authentication: required; role `recruiter`, and the recruiter must own the job.
- Params: `id`.
- Body: job fields to update.
- Response: `{ success: true, job: Job }`.
- Errors: `401`, `403`, `404`, `400`, or `500`.

### PATCH `/api/jobs/:id/publish`
- Authentication: required; role `recruiter`, owner only.
- Response: `{ success: true, job: Job }` with status `published`.
- Errors: `401`, `403`, `404`.

### PATCH `/api/jobs/:id/close`
- Authentication: required; role `recruiter`, owner only.
- Response: `{ success: true, job: Job }` with status `closed`.
- Errors: `401`, `403`, `404`.

### DELETE `/api/jobs/:id`
- Authentication: required; role `recruiter`, owner only.
- Response: `204` with no body.
- Errors: `401`, `403`, `404`.

`Job` statuses are exactly `draft`, `published`, `closed`. `Job` fields: `id`, `companyId`, `recruiterId`, `title`, `description`, `requirements`, `location`, `employmentType`, `experienceLevel`, `salaryMin`, `salaryMax`, `status`, `applicationDeadline`, `createdAt`, `updatedAt`, and optional included `company`.

## Applications

### POST `/api/jobs/:jobId/applications`
- Authentication: required; role `candidate`.
- Params: `jobId`.
- Body: `{ resumeUrl?: string, coverLetter?: string }`.
- Response `201`: `{ success: true, application: Application }`.
- Errors: `401`, `403`, `404` for a missing/unpublished job, `409` for duplicate application, `400` or `500`.

### GET `/api/applications/my`
- Authentication: required; role `candidate`.
- Response: `{ success: true, applications: (Application & { job?: Job })[] }`.
- Errors: `401`, `403`.

### GET `/api/applications/recruiter`
- Authentication: required; role `recruiter`.
- Response: `{ success: true, applications: Application[] }` for jobs owned by the logged-in recruiter, including the job and candidate id/name/email when available.
- Errors: `401`, `403`.

### GET `/api/jobs/:jobId/applications`
- Authentication: required; role `recruiter`, owner of the job.
- Response: `{ success: true, applications: Application[] }`.
- Errors: `401`, `403`, `404`.

### GET `/api/applications/:id`
- Authentication: required; any active role. Candidates can only access their own application; recruiters/admins can access by id.
- Response: `{ success: true, application: Application }`.
- Errors: `401`, `403` only through middleware where applicable, or `404`.

### PATCH `/api/applications/:id/status`
- Authentication: required; role `recruiter` or `admin`. Recruiters can update applications belonging to their jobs.
- Body: `{ status: "applied" | "shortlisted" | "interview" | "selected" | "rejected" | "withdrawn" }`.
- Response: `{ success: true, application: Application }`.
- Errors: `401`, `403`, `404`, `400` for invalid status, or `500`.

### PATCH `/api/applications/:id/withdraw`
- Authentication: required; role `candidate`, owner only.
- Body: none.
- Response: `{ success: true, application: Application }` with status `withdrawn`.
- Errors: `401`, `403`, `404`.

`Application` fields: `id`, `jobId`, `candidateId`, `resumeUrl`, `coverLetter`, `status`, `appliedAt`, `updatedAt`.

## Interviews

### POST `/api/applications/:applicationId/interviews`
- Authentication: required; role `recruiter`, and the recruiter must own the application job.
- Params: `applicationId`.
- Body: `{ scheduledAt: string, meetingLink?: string, notes?: string }`.
- Response `201`: `{ success: true, interview: Interview }`; application status is also changed to `interview`.
- Errors: `401`, `403`, `404`, `400`, or `500`.

### GET `/api/interviews/my`
- Authentication: required; role `candidate`.
- Response: `{ success: true, interviews: Interview[] }`.

### GET `/api/interviews/recruiter`
- Authentication: required; role `recruiter`.
- Response: `{ success: true, interviews: Interview[] }`.

### PATCH `/api/interviews/:id/reschedule`
- Authentication: required; role `recruiter`, owner only.
- Body: interview update fields, normally `{ scheduledAt: string, meetingLink?: string, notes?: string }`.
- Response: `{ success: true, interview: Interview }` with status `rescheduled`.
- Errors: `401`, `403`, `404`, `400`.

### PATCH `/api/interviews/:id/cancel`
- Authentication: required; role `candidate` or `recruiter`, owner of the interview.
- Body: optional interview update fields.
- Response: `{ success: true, interview: Interview }` with status `cancelled`.
- Errors: `401`, `403`, `404`, `400`.

`Interview` statuses are exactly `scheduled`, `completed`, `cancelled`, `rescheduled`.

## Candidate profile and resume

### PATCH `/api/users/profile`
- Authentication: required; role `candidate`.
- Body: `{ phone?: string, location?: string, bio?: string, skills?: string, experience?: string, education?: string }`.
- Response: `{ success: true, profile: CandidateProfile }`.
- Errors: `401`, `403`, `400`, or `500`.

### POST `/api/users/resume`
- Authentication: required; role `candidate`.
- Content type: `multipart/form-data`.
- File field: `resume`.
- Accepted MIME types: PDF, DOC, DOCX. Maximum size: 5 MB.
- Response: `{ success: true, resumeUrl: string }`.
- Errors: `400` for missing/invalid/too-large file, `401`, or `403`.

`CandidateProfile` fields: `id`, `userId`, `phone`, `location`, `bio`, `skills`, `experience`, `education`, `resumeUrl`.

## Notifications

### GET `/api/notifications`
- Authentication: required; any active role.
- Response: `{ success: true, notifications: Notification[] }`, newest first.

### PATCH `/api/notifications/:id/read`
- Authentication: required; any active role, owner only.
- Response: `{ success: true, notification: Notification }`.
- Errors: `401`, `403`, `404`.

### PATCH `/api/notifications/read-all`
- Authentication: required; any active role.
- Response: `{ success: true }`.
- Errors: `401`, `403`.

## Admin

All admin endpoints require authentication and role `admin`.

### GET `/api/admin/users`
- Response: `{ success: true, users: User[] }`.

### PATCH `/api/admin/users/:id/status`
- Body: `{ isActive: boolean }`.
- Response: `{ success: true, user: User }`.
- Errors: `404` if user is missing, plus auth/validation errors.

### GET `/api/admin/companies`
- Response: `{ success: true, companies: Company[] }`.

### PATCH `/api/admin/companies/:id/approve`
- Body: `{ isApproved?: boolean }`; omitted or any value other than `false` approves.
- Response: `{ success: true, company: Company }`.
- Errors: `404` if company is missing.

### GET `/api/admin/jobs`
- Response: `{ success: true, jobs: Job[] }`.

### GET `/api/admin/applications`
- Response: `{ success: true, applications: Application[] }`.

### GET `/api/admin/dashboard`
- Response: `{ success: true, statistics: { users: number, companies: number, jobs: number, applications: number } }`.

## Deliberately unsupported backend capabilities

- No refresh-token route or refresh token response exists.
- No recruiter-specific profile model or endpoint exists; recruiter profile editing uses `/api/auth/profile`, while company data uses `/api/companies`.
- No admin interview endpoint exists.
- No admin notification/activity-log endpoint exists.
- No recruiter-owned jobs list endpoint exists; the frontend can only list/manage a recruiter’s jobs if the backend adds one. The UI therefore avoids claiming a complete own-jobs list and links to create/manage actions that have a known job id.
- No application resume upload endpoint exists; applications accept an optional `resumeUrl` string, while candidate resumes are uploaded separately through `/api/users/resume`.
