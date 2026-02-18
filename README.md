# Research Paper Reading Tracker

A full-stack app to manage research papers, track reading progress, filter your paper library, and view analytics from your reading data.

## What This Project Does

- User signup/login with JWT auth
- Add papers with metadata (domain, impact, citations, stage, date)
- Optionally attach a paper PDF while creating a record (not required)
- Update reading stage from the library table
- Track stage change history per paper
- Filter papers and analytics using shared filters
- Visualize progress using funnel, scatter, and stacked charts

## Tech Stack

- Frontend: React, TypeScript, Vite, Material UI, Recharts
- Backend: Node.js, Express, TypeScript
- Database: MongoDB with Mongoose
- Auth: JWT + bcrypt password hashing

## System Flow

### 1. Authentication Flow

```text
User -> /api/auth/signup or /api/auth/login
     -> Backend validates input
     -> Password hashed/verified (bcrypt)
     -> JWT issued
     -> Frontend stores token in localStorage (rpt_auth_token)
     -> Future API calls include Authorization: Bearer <token>
```

### 2. Paper Lifecycle Flow

```text
Add Paper page
  -> POST /api/papers
  -> Optional inline PDF upload (base64, max 10MB)
  -> Backend stores paper + initial readingStageHistory entry
  -> Paper saved with userId ownership

Paper Library page
  -> GET /api/papers with filters
  -> User sees scoped data for only their account
  -> User updates stage
  -> PATCH /api/papers/:id/reading-stage
  -> Backend updates readingStage and appends readingStageHistory
```

### 3. Analytics Flow

```text
Analytics page filter change
  -> Frontend calls 4 endpoints in parallel:
     /api/analytics/funnel
     /api/analytics/scatter
     /api/analytics/stacked-domain-stage
     /api/analytics/summary
  -> Backend applies same filter builder logic used by /papers
  -> MongoDB aggregation returns chart-ready datasets
  -> Recharts renders updated visuals
```

### 4. Request Security and User Isolation

```text
Protected route request
  -> requireAuth middleware verifies JWT
  -> req.user is set from token payload
  -> Queries always include userId filter
  -> Each user can only read/write their own papers
```

## Data Model

### Paper

- `title` (string, required)
- `firstAuthorName` (string, required)
- `researchDomain` (enum, required)
- `readingStage` (enum, required)
- `readingStageHistory` (array of stage + changedAt)
- `citationCount` (number >= 0, required)
- `impactScore` (enum, required)
- `dateAdded` (date, required)
- `paperFileUrl` (string, optional)
- `paperFileName` (string, optional)
- `userId` (ObjectId, required)
- `createdAt`, `updatedAt` (timestamps)

### Supported Enums

- Reading stages:
  - `Abstract Read`
  - `Introduction Done`
  - `Methodology Done`
  - `Results Analyzed`
  - `Fully Read`
  - `Notes Completed`
- Impact scores:
  - `High Impact`
  - `Medium Impact`
  - `Low Impact`
  - `Unknown`
- Date filter presets:
  - `this_week`
  - `this_month`
  - `last_3_months`
  - `all_time`

## API Endpoints

### Auth

- `POST /api/auth/signup`
- `POST /api/auth/login`

### Papers (Authenticated)

- `POST /api/papers`
- `GET /api/papers`
- `PATCH /api/papers/:id/reading-stage`

### Analytics (Authenticated)

- `GET /api/analytics/funnel`
- `GET /api/analytics/scatter`
- `GET /api/analytics/stacked-domain-stage`
- `GET /api/analytics/summary`

### Utility

- `GET /health`

## Query Filters

The following query params are supported on `GET /api/papers` and all analytics endpoints:

- `readingStage` (comma-separated values)
- `researchDomain` (comma-separated values)
- `impactScore` (comma-separated values)
- `dateAdded` (`this_week`, `this_month`, `last_3_months`, `all_time`)

Additional sorting params are supported on `GET /api/papers`:

- `sortBy` (`dateAdded`, `citationCount`, `updatedAt`, `title`, `firstAuthorName`)
- `sortOrder` (`asc`, `desc`)

Example:

```http
GET /api/papers?readingStage=Abstract%20Read,Fully%20Read&impactScore=High%20Impact&dateAdded=this_month&sortBy=citationCount&sortOrder=desc
```

## Project Structure

```text
backend/
  src/
    app.ts
    index.ts
    config/db.ts
    middleware/auth.middleware.ts
    models/
      paper.model.ts
      user.model.ts
    routes/
      auth.routes.ts
      papers.routes.ts
      analytics.routes.ts
    utils/
      constants.ts
      jwt.ts
      query.ts
    types/
      express.d.ts
frontend/
  src/
    api/client.ts
    auth/
      AuthContext.tsx
      ProtectedRoute.tsx
    components/
      AppShell.tsx
      FilterPanel.tsx
    pages/
      LoginPage.tsx
      SignupPage.tsx
      AddPaperPage.tsx
      PaperLibraryPage.tsx
      AnalyticsPage.tsx
    App.tsx
    main.tsx
```

## Local Setup

### 1) Backend

```bash
cd backend
npm install
cp .env.example .env
```

Set `backend/.env`:

```env
PORT=5000
MONGODB_URI=<your-mongodb-uri>
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=<your-long-random-secret>
```

Run backend:

```bash
npm run dev
```

### 2) Frontend

```bash
cd frontend
npm install
cp .env.example .env
```

Set `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Run frontend:

```bash
npm run dev
```

## Scripts

### Backend (`backend/package.json`)

- `npm run dev` - run API with nodemon + ts-node
- `npm run build` - compile TypeScript to `dist`
- `npm run start` - run compiled server

### Frontend (`frontend/package.json`)

- `npm run dev` - run Vite dev server
- `npm run build` - type check + production build
- `npm run preview` - preview production build locally

## Deployment Notes

- Frontend can be deployed to Vercel/Netlify
- Backend can be deployed to Render/Railway
- Use MongoDB Atlas for production database
- In production, set strict `CORS_ORIGIN` and strong `JWT_SECRET`

## Current Limitations / Future Improvements

- No automated test suite yet
- No refresh token flow (single JWT auth token)
- No pagination on paper library
- No role-based access (single-user scope model)
- Could add paper search, tags, export, and reminder workflows
