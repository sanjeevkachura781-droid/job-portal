# Frontend Testing Guide

## URLs and accounts

- Frontend: `http://localhost:5173` or `http://localhost:5174` when the default port is occupied.
- Backend: `http://localhost:5000`.
- Use timestamped QA accounts such as `qa-candidate-<timestamp>@test.com` and `qa-recruiter-<timestamp>@test.com`.
- Admin credentials must come from the backend environment and must never be displayed in the UI or this guide.

## Pages and visible actions

Public:

- `/jobs`: Browse Jobs, Sign In, Create Account, search/filter, and View Details on every job card.
- `/jobs/:id`: Back to Jobs, Sign In, Create Account, and Submit Application for candidates.
- `/login`: Sign In.
- `/register`: Create Account with candidate/recruiter role selection.

Candidate:

- `/candidate`: Dashboard and Quick Actions for Find Jobs, profile, applications, interviews.
- `/candidate/profile`: Update profile, account details, and Upload resume.
- `/candidate/applications`: View applications and Withdraw an application.
- `/candidate/interviews`: View interviews and Cancel an interview.
- `/notifications`: View notifications, Mark read, and Mark all read.
- Sidebar: Dashboard, Find Jobs, My Applications, Interviews, Profile, Notifications, Sign Out.

Recruiter:

- `/recruiter`: Dashboard.
- `/recruiter/company`: Create company or edit the owned company.
- `/recruiter/jobs`: My Jobs, Create Job, Edit job, Publish job, Close job, and View applications.
- `/recruiter/jobs/new`: Create Job form, reachable from the sidebar and dashboard action.
- `/recruiter/jobs/:id/edit`: Edit Job form.
- `/recruiter/applications`: Owned applications, candidate information when returned by the API, status dropdown, and Schedule interview form with date, meeting link, and notes.
- `/recruiter/interviews`: View recruiter interviews and cancel/reschedule through supported APIs.
- Sidebar: Dashboard, Company, Create Job, My Jobs, Applications, Interviews, Notifications, Sign Out.

Admin:

- `/admin`: Dashboard statistics and management quick actions.
- `/admin/users`: Activate/deactivate users.
- `/admin/companies`: Approve/unapprove companies.
- `/admin/jobs`: View jobs.
- `/admin/applications`: View applications.
- `/notifications`: View and mark notifications read.
- Sidebar: Dashboard, Users, Companies, Jobs, Applications, Notifications, Sign Out.

## End-to-end workflow

1. Log in as admin and approve the recruiter company.
2. Log in as recruiter and use the visible Create Job button.
3. Open My Jobs, publish the draft, and open View applications.
4. Log in as candidate, use Find Jobs, open View Details, and submit an application.
5. Log in as recruiter, open Applications, change status to shortlisted/interview/selected/rejected, and schedule an interview.
6. Log in as candidate, open Interviews, verify the scheduled interview, and test cancellation.
7. Test role-protected URLs redirect to the correct role dashboard.
8. Test Sign Out and confirm protected pages redirect to `/login`.

## Expected states

- Loading indicators appear while API requests are pending.
- Empty states appear for accounts with no jobs, applications, interviews, or notifications.
- API errors are displayed as useful messages rather than generic missing-resource text.
- Mutating buttons disable while requests are pending.
- Destructive close actions currently use a browser confirmation; withdraw, delete, deactivate, and cancel should be covered by the next confirmation-dialog pass.

## Backend endpoints used

- Recruiter-owned jobs: `GET /api/jobs/mine`.
- Recruiter-owned applications: `GET /api/applications/recruiter`.
- Existing job, application, company, interview, notification, auth, candidate, and admin routes are documented in `FRONTEND_API_MAPPING.md`.

## Known limitations

- The backend has no admin interview or admin notification-management endpoint, so the UI does not invent those actions.
- Resume upload is a separate candidate profile action; application submission accepts an optional existing `resumeUrl`.
- Browser tests should use Chromium with unique QA emails and should not print tokens or environment values.
