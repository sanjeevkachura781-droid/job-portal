# Job Portal and Applicant Tracking System

## Run

1. Create a MySQL database and copy `.env.example` to `.env` without replacing existing secrets.
2. Install dependencies with `npm install`.
3. Start development mode with `npm run dev`.

The API runs on `http://localhost:5000` by default. Health check: `GET /api/health`.

## Checks

- `npm run typecheck`
- `npm run build`
- `npm test`

Create an administrator only through `npm run seed:admin` after setting `ADMIN_EMAIL` and `ADMIN_PASSWORD` in the environment.
