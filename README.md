# Job Application Tracker

A full-stack app for tracking job applications — company, role, status, and notes — built to practice and demonstrate a standard modern web stack end to end (auth, a relational database, a REST API, and a typed frontend).

## Tech stack

| Layer     | Choice                                             |
|-----------|-----------------------------------------------------|
| Frontend  | React, TypeScript, Vite, Tailwind CSS, React Router |
| Backend   | Node.js, Express, TypeScript                        |
| Database  | PostgreSQL (hosted on [Neon](https://neon.tech))    |
| ORM       | Prisma                                              |
| Auth      | JWT + bcrypt (self-implemented, not a managed service) |

## Features

- Email/password signup and login
- Create, list, edit, and delete job applications
- Update an application's status (Applied / Interviewing / Offer / Rejected) inline
- All data scoped per-user — one account can't see another's applications

## Project structure

```
job-tracker/
├── client/    React frontend (Vite + TypeScript + Tailwind)
└── server/    Express API (TypeScript + Prisma)
```

## Running locally

Requires Node.js and a PostgreSQL database (this project was built against a free [Neon](https://neon.tech) instance).

```bash
# from the repo root
npm install                  # installs the root dev tooling (concurrently)
npm install --prefix client
npm install --prefix server

# server/.env
DATABASE_URL="your-postgres-connection-string"
JWT_SECRET="any-long-random-string"
PORT=4000

# client/.env
VITE_API_URL=http://localhost:4000

# push the schema to your database
npm run --prefix server db:push  # or: cd server && npx prisma db push

# run both frontend and backend together
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:4000

## API overview

| Method | Route                    | Auth required | Description                  |
|--------|---------------------------|:---:|-------------------------------|
| POST   | `/api/auth/signup`        |     | Create an account, returns a JWT |
| POST   | `/api/auth/login`         |     | Log in, returns a JWT         |
| GET    | `/api/applications`       | ✓   | List the current user's applications |
| POST   | `/api/applications`       | ✓   | Create an application         |
| PUT    | `/api/applications/:id`   | ✓   | Update an application         |
| DELETE | `/api/applications/:id`   | ✓   | Delete an application         |

## What I'd improve with more time

- Drag-and-drop Kanban board instead of a plain table
- Pagination/search once the list grows
- Swap the hand-rolled JWT auth for a managed provider (e.g. Auth0/Clerk) — kept it manual here deliberately, to understand how token-based auth works
- Deploy live (Vercel for the client, Render/Railway for the API)
