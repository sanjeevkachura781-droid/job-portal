# Job Portal QA Test Plan

## Scope

This plan covers the Express/Sequelize backend at `http://localhost:5000`, the Vite frontend, and the browser-visible workflows using isolated QA accounts. Existing database data must be preserved; tests create only timestamped QA records.

## Roles and permissions

- `candidate`: browse published jobs, maintain candidate profile and resume, apply once per job, view/withdraw own applications, view/cancel own interviews, view/read own notifications.
- `recruiter`: create and manage owned companies, create/manage owned jobs, publish/close owned jobs, view applications for owned jobs, schedule/reschedule/cancel owned interviews.
- `admin`: view dashboard statistics, users, companies, jobs, and applications; activate/deactivate users; approve/unapprove companies; update application status.
- Protected routes require a bearer token. Role failures return `403`; missing, invalid, or expired tokens return `401`.

## Backend routes

- Health/root: `GET /`, `GET /api/health`
- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `PATCH /api/auth/profile`
- Companies: `GET /api/companies`, `GET /api/companies/:id`, `GET /api/companies/mine` (recruiter), `POST /api/companies`, `PATCH /api/companies/:id`, `DELETE /api/companies/:id`
- Jobs: `GET /api/jobs`, `GET /api/jobs/:id`, `POST /api/jobs`, `PATCH /api/jobs/:id`, `PATCH /api/jobs/:id/publish`, `PATCH /api/jobs/:id/close`, `DELETE /api/jobs/:id`
- Applications: `POST /api/jobs/:jobId/applications`, `GET /api/applications/my`, `GET /api/jobs/:jobId/applications`, `GET /api/applications/:id`, `PATCH /api/applications/:id/status`, `PATCH /api/applications/:id/withdraw`
- Interviews: `POST /api/applications/:applicationId/interviews`, `GET /api/interviews/my`, `GET /api/interviews/recruiter`, `PATCH /api/interviews/:id/reschedule`, `PATCH /api/interviews/:id/cancel`
- Candidate: `PATCH /api/users/profile`, `POST /api/users/resume`
- Notifications: `GET /api/notifications`, `PATCH /api/notifications/:id/read`, `PATCH /api/notifications/read-all`
- Admin: `GET /api/admin/dashboard`, `GET/PATCH /api/admin/users`, `GET/PATCH /api/admin/companies`, `GET /api/admin/jobs`, `GET /api/admin/applications`

## Frontend pages and navigation

- Public: `/jobs`, `/jobs/:id`, `/login`, `/register`
- Candidate: `/candidate`, `/candidate/profile`, `/candidate/applications`, `/candidate/interviews`
- Recruiter: `/recruiter`, `/recruiter/company`, `/recruiter/jobs/new`, `/recruiter/jobs/:id/edit`, `/recruiter/interviews`
- Admin: `/admin`, `/admin/users`, `/admin/companies`, `/admin/jobs`, `/admin/applications`
- Shared authenticated page: `/notifications`
- Unauthenticated users are redirected to `/login`; role mismatches redirect to that role's home page.

## Expected workflows

1. Register and log in unique candidate and recruiter accounts; verify token persistence after refresh, logout, invalid login, duplicate email, and invalid/empty form values.
2. Recruiter creates a company, loads only `GET /api/companies/mine`, updates only the owned company, creates a draft job, publishes/closes it, and cannot modify another recruiter's records.
3. Admin is created only by `npm run seed:admin`; admin can manage users, company approvals, jobs, applications, and dashboard statistics; non-admins cannot access admin routes.
4. Candidate updates profile/account, uploads valid and invalid resumes, browses/searches/filter jobs, opens details, applies once, views and withdraws the application, and cannot access another candidate's application.
5. Candidate and recruiter interview/notification pages load and role guards apply.
6. End-to-end: recruiter/company -> admin approval -> published job -> candidate application -> admin/recruiter visibility -> candidate withdrawal.

## Error expectations

- `400`: validation or invalid upload/input.
- `401`: missing/invalid/expired token or invalid credentials.
- `403`: inactive account or wrong role/ownership where applicable.
- `404`: unknown resource or unpublished/missing job.
- `409`: duplicate email or duplicate application.
- `500`: unexpected server/model failures, surfaced by the frontend error message helper.

## Static and live checks

Backend: `npm install`, `npm run typecheck`, `npm run build`, `npm test`.
Frontend: `npm install`, `npm run lint`, `npm run build`.
Live servers: backend port `5000`; Vite port detected from output, expected `5173` or `5174`.
Browser runner: Playwright Chromium under `job-portal-frontend/e2e/`.
