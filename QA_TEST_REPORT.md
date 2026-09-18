# Job Portal QA Test Report

## Summary

Backend checks: PASS
Frontend checks: PASS
Browser tests: PASS
Bugs fixed: 1
Remaining issues: 1 verification limitation

No passwords, JWT secrets, or private environment values are included in this report.

## Commands executed

Backend:

- `npm install`
- `npm run typecheck` -> PASS
- `npm run build` -> PASS
- `npm test -- --reporter=verbose` -> 2 test files and 2 tests passed
- `npm run seed:admin` -> completed successfully; credentials were not printed
- `npm run dev` -> backend started on port 5000 and connected to the existing MySQL database without dropping tables

Frontend:

- `npm install`
- `npm run lint` -> PASS with no reported findings
- `npm run build` -> PASS
- `npm run dev -- --host localhost` -> Vite started on port 5173
- `npm run test:e2e` -> PASS

Live health:

- `GET http://localhost:5000/api/health` returned `{ "success": true, "message": "Job Portal API is running" }`.

## Browser tests executed

The Chromium smoke suite in `job-portal-frontend/e2e/smoke.ts` tested the real frontend for:

- Public jobs page rendering.
- Invalid login feedback using unique, syntactically valid credentials.
- Candidate registration and candidate dashboard redirect.
- Candidate token persistence after page refresh.
- Candidate logout and redirect to login.
- Recruiter registration and recruiter dashboard redirect.
- Recruiter company page access.
- Recruiter job form access.
- Recruiter job form request to `GET /api/companies/mine`.
- No unexpected console errors or 5xx network responses.

The browser run created only timestamped QA accounts.

## Bug found and fixed

### Recruiter job form used the public company list

- Root cause: `JobForm` queried `companyApi.list()`, which calls public `GET /api/companies`; that endpoint returns approved companies rather than the authenticated recruiter’s companies.
- Risk: the recruiter could be shown another recruiter’s company and submit a job with the wrong ownership context.
- Fix: `JobForm` now queries `companyApi.mine()` with query key `["company", "mine"]`, matching the backend ownership contract `GET /api/companies/mine`.
- Regression coverage: the Chromium smoke test asserts that the recruiter job form requests `/api/companies/mine`.

## Files changed

- `QA_TEST_PLAN.md`
- `QA_TEST_REPORT.md`
- `job-portal-frontend/package.json`
- `job-portal-frontend/package-lock.json` (Playwright and TSX dependencies)
- `job-portal-frontend/src/pages/Pages.tsx`
- `job-portal-frontend/e2e/smoke.ts`

## Passed backend contract review

The inspected backend includes role guards and ownership filters for recruiter companies/jobs, candidate applications, admin routes, candidate profile/resume routes, interviews, and notifications. Existing health and environment tests pass. The backend does not drop or reset tables during the QA run.

## Remaining limitations

- A broader live API workflow probe was attempted with fresh QA records but PowerShell entered an interactive web-request parser prompt after an initial scalar parsing mistake. It was stopped without completing the probe, and no report output included credentials or tokens. The browser workflow and backend route inspection were completed; explicit live assertions for admin approval, job publishing, duplicate applications, withdrawal, and cross-user API ownership should still be rerun from a clean noninteractive shell.
- Existing automated backend coverage remains limited to health and environment tests; the browser smoke suite covers the highest-risk frontend auth and recruiter-company path but not every listed endpoint.
- No personal resume fixture was committed. Resume MIME/size cases remain a manual or future isolated test task.

## Manual tests still recommended

- Run the full recruiter -> admin approval -> publish -> candidate apply -> withdraw flow from a clean noninteractive API or browser session.
- Verify admin user activation/deactivation and non-admin `403` responses.
- Verify valid PDF/DOC/DOCX resume upload, invalid MIME rejection, and over-5 MB rejection.
- Verify interview scheduling, rescheduling, cancellation, and notification read actions.
- Check responsive mobile layouts and browser refresh on every protected route.

## Startup commands

Backend:

```text
cd job-portal-backend
npm run dev
```

Frontend:

```text
cd job-portal-backend/job-portal-frontend
npm run dev
```

Expected URLs: backend `http://localhost:5000`, frontend `http://localhost:5173` unless Vite selects another available port.
