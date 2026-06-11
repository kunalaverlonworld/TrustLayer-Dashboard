# TrustLayer — Project Documentation

> **Last Updated:** June 11, 2026  
> **Prepared by:** Antigravity AI  

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture Overview](#2-architecture-overview)
3. [Repository Structure](#3-repository-structure)
4. [Tech Stack](#4-tech-stack)
5. [Features](#5-features)
6. [Authentication & Multi-Tenancy System](#6-authentication--multi-tenancy-system)
7. [Registration Flow (End-to-End)](#7-registration-flow-end-to-end)
8. [Database Models (MongoDB Schemas)](#8-database-models-mongodb-schemas)
9. [Backend API Reference](#9-backend-api-reference)
10. [Trust Score Algorithm](#10-trust-score-algorithm)
11. [Frontend Components](#11-frontend-components)
12. [Environment Variables](#12-environment-variables)
13. [Local Development Setup](#13-local-development-setup)
14. [Deployment (Render)](#14-deployment-render)
15. [Git Repositories](#15-git-repositories)
16. [Security Measures](#16-security-measures)
17. [Changes Made in This Session](#17-changes-made-in-this-session)

---

## 1. Project Overview

**TrustLayer** is an AI-powered Candidate & Employee Trust Intelligence SaaS platform. It helps hiring teams and HR departments assess the trustworthiness and reliability of candidates before and after they join.

### Core Value Proposition

| Problem | TrustLayer Solution |
|---|---|
| Candidates ghost after offer acceptance | AI Ghosting Detection with automatic score penalty |
| No way to verify past employment behaviour | HR Feedback Portal (no account needed for past employers) |
| Trust scores are subjective | Objective scoring using engagement signals + HR data |
| Employee behavioural risk not monitored | Employee Behaviour Intelligence (rolling 90-day window) |
| Each company's data mixed together | Fully isolated multi-tenant dashboard per company |

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      TRUSTLAYER PLATFORM                         │
│                                                                   │
│  ┌──────────────────┐        ┌───────────────────────────────┐  │
│  │  Landing Page     │        │   Dashboard (SaaS App)         │  │
│  │  (trustlayer)     │        │   (trustlayer-dashboard-temp)  │  │
│  │                   │        │                                 │  │
│  │  React + Vite     │──SSO──▶│  Frontend: React + Vite        │  │
│  │  TypeScript       │        │  Backend:  Express + TypeScript │  │
│  │  Port: 5173       │        │  Ports: 5174 (FE), 5000 (BE)  │  │
│  └────────┬──────────┘        └──────────────┬────────────────┘  │
│           │                                   │                   │
│           │ /api/lms/*                        │ MongoDB           │
│           ▼                                   ▼                   │
│  ┌──────────────────┐        ┌───────────────────────────────┐  │
│  │  External LMS     │        │   MongoDB Atlas                │  │
│  │  (license-system) │        │   Collections:                 │  │
│  │  license mgmt     │        │   - companies, users,          │  │
│  │  customer sync    │        │   - trustmetrics, employees,   │  │
│  └──────────────────┘        │   - hrfeedback, incidents      │  │
│                               └───────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow Summary

1. **User registers** on the Landing Page → synced to LMS + mirrored in MongoDB
2. **User clicks "Go to Dashboard"** → SSO token issued → redirected to Dashboard
3. **Dashboard** reads user's `companyId` from JWT → all queries scoped to that company
4. **Recruitment API** (external) feeds candidate tracking data filtered by `companyName`

---

## 3. Repository Structure

### Repo 1: Landing Page (`trustlayer`)

```
trustlayer/
├── src/
│   ├── app/
│   │   ├── App.tsx                    # Root component, auth state management
│   │   ├── components/
│   │   │   ├── HeroSection.tsx        # Landing hero
│   │   │   ├── FeaturesSection.tsx    # Feature cards
│   │   │   ├── PricingSection.tsx     # Pricing tiers + checkout
│   │   │   ├── LoginPage.tsx          # Login + Registration form
│   │   │   ├── FloatingNavbar.tsx     # Sticky navigation
│   │   │   ├── CheckoutModal.tsx      # Payment/subscription modal
│   │   │   ├── AITrustEngine.tsx      # AI engine explainer section
│   │   │   ├── DashboardShowcase.tsx  # Dashboard preview section
│   │   │   ├── HowItWorks.tsx        # Step-by-step walkthrough
│   │   │   ├── FAQSection.tsx        # FAQ accordion
│   │   │   ├── TrustAnalytics.tsx    # Analytics preview
│   │   │   ├── Footer.tsx            # Site footer
│   │   │   └── ContactSupport.tsx    # Support form
│   │   └── services/
│   │       ├── authService.ts        # LMS auth, session management, SSO
│   │       └── config.ts             # BACKEND_URL, LMS_PROXY, PRODUCT_ID
│   └── main.tsx
├── backend/                           # Landing page's own mini-backend (proxy)
├── index.html
├── vite.config.ts
└── package.json
```

### Repo 2: Dashboard (`trustlayer-dashboard-temp`)

```
trustlayer-dashboard-temp/
├── backend/
│   └── src/
│       ├── app.ts                     # Express app setup, middleware, routes
│       ├── server.ts                  # MongoDB connect + server start
│       ├── routes/
│       │   ├── auth.ts                # /login, /me, /sso
│       │   ├── Company.ts             # /register (direct company + user creation)
│       │   ├── lmsProxy.ts            # /api/lms/* proxy → LMS + DB mirror
│       │   ├── trustLayer.ts          # /all, /:id (candidate dashboard data)
│       │   ├── employee.ts            # Employee CRUD
│       │   ├── hrFeedback.ts          # HR feedback form submission
│       │   ├── trustScore.ts          # Score recalculation
│       │   ├── trustExplain.ts        # AI score explanation
│       │   ├── incident.ts            # Incident types management
│       │   ├── user.ts                # User management
│       │   └── razorpay.ts            # Payment integration
│       ├── models/
│       │   ├── Company.ts
│       │   ├── User.ts
│       │   ├── TrustMetrics.ts
│       │   ├── Employee.ts
│       │   ├── HrFeedback.ts
│       │   ├── EmployeeIncident.ts
│       │   ├── IncidentType.ts
│       │   ├── CandidateInteraction.ts
│       │   └── Counter.ts
│       ├── middlewares/
│       │   ├── auth.ts                # JWT verify → req.user injection
│       │   ├── errorHandler.ts        # Global error handler
│       │   └── roleGuard.ts           # Role-based access control
│       └── utils/
│           ├── calculateTrustMetrics.ts    # Final trust score formula
│           ├── calculateInteractionMetrics.ts
│           ├── resolveCompany.ts
│           ├── generateEmployeeId.ts
│           └── logger.ts
├── frontend/
│   └── src/
│       ├── App.tsx
│       ├── components/
│       │   ├── auth/
│       │   │   └── AuthContext.tsx    # Global auth state, user type
│       │   ├── core/
│       │   │   └── Header.tsx        # Nav header with company name
│       │   ├── dashboard/
│       │   │   ├── Dashboard.tsx     # Main dashboard view
│       │   │   ├── DashboardInsights.tsx
│       │   │   └── SummaryCards.tsx
│       │   ├── employees/            # Employee management UI
│       │   └── layouts/              # Layout wrappers
│       └── pages/                    # Page-level components
├── render.yaml                        # Render deployment config
└── docker-compose.yml
```

---

## 4. Tech Stack

### Landing Page

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build Tool | Vite |
| Styling | Vanilla CSS + Tailwind CSS |
| Icons | Lucide React |
| HTTP Client | Native `fetch` API |
| State | React `useState` / `useEffect` |
| Auth Storage | `sessionStorage` + `localStorage` |
| Deployment | Render (Static Site) |

### Dashboard Frontend

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build Tool | Vite |
| Styling | CSS Modules / Inline styles |
| Icons | Lucide React |
| HTTP Client | Axios / `fetch` |
| State | React Context API (`AuthContext`) |
| Routing | React Router v6 |
| Deployment | Render (Static Site) |

### Dashboard Backend

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js + TypeScript |
| Database | MongoDB Atlas (Mongoose ODM) |
| Authentication | JWT (`jsonwebtoken`) |
| Password Hashing | bcrypt |
| Security | Helmet, CORS, express-rate-limit, HPP |
| Logging | Morgan + custom Winston logger |
| HTTP Client | Axios (for external API calls) |
| Payment | Razorpay |
| Deployment | Render (Web Service) |

### External Services

| Service | Purpose |
|---|---|
| LMS (license-system.onrender.com) | Customer registration & license management |
| Recruitment API | Candidate tracking & ghosting data feed |
| Razorpay | Payment processing |
| MongoDB Atlas | Primary database |
| Render | Cloud hosting (all services) |

---

## 5. Features

### 5.1 AI Trust Score Engine
- Computes a **0–100 Trust Score** per candidate from two signal sources:
  - **Engagement Signals** (email opens, link clicks, response time) — 60% weight
  - **HR Feedback Score** (from past employers) — 40% weight (when available)
- **Ghosting Penalty**: −20 points if candidate is flagged as ghosting
- Scores refresh automatically every 10 seconds in the dashboard

### 5.2 AI Ghosting Detection
- Monitors email open rates, click rates, and reply patterns
- Automatically flags candidates who go silent
- Applies a 20-point penalty to their Trust Score
- Shows "Ghosting" badge in dashboard table

### 5.3 Employee Behaviour Intelligence
- HR team logs incidents (positive or negative) for current employees
- Scores are computed on a **rolling 90-day window** — recent behaviour weights more
- Risk Level (`Low`, `Moderate`, `High`) visible on each employee card

### 5.4 Trust Intelligence Dashboard
- Single-view table of all candidates with live Trust Scores
- Real-time score refresh (10-second polling)
- Risk level colour coding: 🟢 Low / 🟡 Moderate / 🔴 High
- Drill-down profile view with full breakdown
- **Multi-tenant**: each company sees only their own data

### 5.5 HR Feedback Portal
- Public-facing form — **no account required** for past employers
- Covers 5 scoring dimensions:
  1. Reliability
  2. Communication
  3. Commitment
  4. Rehire-ability
  5. Offer Outcome
- Score is blended into candidate's final Trust Score

### 5.6 Multi-Tenant Company Dashboard
- Every registered company gets a **completely isolated dashboard**
- All data queries filtered by `companyId` (MongoDB ObjectId)
- Candidate data from external API filtered by `companyName`
- A new company sees an empty dashboard from day one

### 5.7 Subscription & Licensing
- Plan tiers: **Basic → Starter → Pro → Enterprise**
- Plans managed via external LMS
- Webhook from LMS auto-updates company's subscription plan in MongoDB
- Razorpay integration for payment checkout

### 5.8 SSO (Single Sign-On) Redirect
- Landing page user clicks "Go to Dashboard"
- Backend issues a **7-day JWT** via `/api/auth/sso`
- Frontend redirects to `/sso?token=...` in new tab
- Dashboard auto-authenticates and loads user's company view

---

## 6. Authentication & Multi-Tenancy System

### JWT Payload Structure

```json
{
  "userId":    "MongoDB ObjectId of User",
  "companyId": "MongoDB ObjectId of Company",
  "role":      "manager | hr | superadmin",
  "planName":  "basic | starter | pro | enterprise",
  "licenseId": "LMS license ID",
  "sso":       true,
  "iat":       1718000000,
  "exp":       1718604800
}
```

### Token Lifetime
| Flow | Expiry |
|---|---|
| Direct login (`/api/auth/login`) | 1 day |
| SSO redirect (`/api/auth/sso`) | 7 days |

### Auth Middleware (`middlewares/auth.ts`)

Applied to all dashboard data routes. Extracts JWT, verifies it, and injects:

```typescript
req.user = {
  userId:    decoded.userId,
  companyId: decoded.companyId,
  role:      decoded.role,
}
```

### Multi-Tenancy Isolation

Every protected route uses `req.user.companyId` to scope all database queries:

```typescript
// Example from trustLayer.ts
const metrics = await TrustMetrics.find({ companyId: userCompanyId }).limit(100);
```

For the external Recruitment API, filtering is done by `companyName`:

```typescript
rawData = allRaw.filter(item =>
  item.candidate?.companyName?.trim().toLowerCase() === userCompanyName.trim().toLowerCase()
);
```

### Roles

| Role | Access Level |
|---|---|
| `superadmin` | Full access — created via direct company registration |
| `manager` | Dashboard access — created via SSO from landing page |
| `hr` | HR-specific access — created by admin |

---

## 7. Registration Flow (End-to-End)

```
User on Landing Page → Fills Registration Form
(name, email, password, Company Name)
         │
         ▼
POST /api/lms/register
         │
    ┌────┴────┐
    │         │
    ▼         ▼
LMS Sync    Backend DB Mirror (NEW — fixed in this session)
(external)  ├── Find or Create Company (using companyName)
            └── Create User (bcrypt hash of password)
         │
         ▼
Auto Login via lmsLogin()
         │
         ▼
User sees "Go to Dashboard" button
         │
         ▼
POST /api/auth/sso  { email, name, planName, companyName }
         │
         ▼  (user already exists → just issue JWT)
JWT Token (7 days)
         │
         ▼
Redirect → http://localhost:5174/sso?token=...
         │
         ▼
Dashboard reads token → AuthContext.user populated
         │
         ▼
GET /api/auth/me → returns { user: { companyName, ... }, planName }
         │
         ▼
Header shows: "Acme Corp"
Dashboard title: "Acme Corp Trust Dashboard"
```

> **Key Fix:** Before this session, the backend DB user was only created at SSO time.
> Now it is created **immediately at registration** so the user exists in MongoDB from day one.

---

## 8. Database Models (MongoDB Schemas)

### Company

```typescript
{
  name:             String (required),
  companyCode:      String (required, unique, uppercase),
  subscriptionPlan: "basic" | "starter" | "pro" | "enterprise",
  isActive:         Boolean (default: true),
  createdAt, updatedAt
}
```

### User

```typescript
{
  companyId:    ObjectId → Company (required, indexed),
  name:         String (required),
  email:        String (required, lowercase),
  role:         "superadmin" | "hr" | "manager",
  passwordHash: String (select: false — never returned in queries),
  isActive:     Boolean (default: true),
  createdAt, updatedAt
}
// Unique compound index: { companyId, email }
```

### TrustMetrics (Candidate & Employee)

```typescript
{
  // Tenant isolation
  companyId:          ObjectId → Company (indexed),
  companyName:        String (indexed — for external API matching),

  // Type discriminator
  applicationId:      String  (candidates — from recruitment software),
  employeeId:         ObjectId → Employee,

  // Candidate details
  candidateName, candidateEmail, jobTitle, department, location, yearsOfExperience,

  // Engagement signals
  openCount, clickCount, lastOpenedAt, lastClickAt, sentAt,

  // Computed
  engagementScore:          Number (0–1),
  timeToInteractionSeconds: Number,
  isGhosting:               Boolean,

  // HR workflow
  hrFeedbackSubmitted: Boolean,
  hrFeedbackEmailSent: Boolean,
}
// Unique index: { companyName, applicationId } for candidates
// Unique index: { companyId, employeeId } for employees
```

### HrFeedback

```typescript
{
  applicationId:      String (required),
  companyName:        String (required, indexed),
  companyId:          ObjectId → Company,

  reliabilityScore:   Number,
  communicationScore: Number,
  commitmentScore:    Number,
  rehireScore:        Number,
  offerOutcomeScore:  Number,
  comments:           String,
  calculatedHrScore:  Number (0–100 normalized),
}
```

### Employee

```typescript
{
  companyId:         ObjectId → Company (required),
  createdBy:         ObjectId → User (required),
  employeeId:        String (required),
  name, email, department, designation,
  dateOfJoining:     Date,
  isActive:          Boolean,
  currentTrustScore: Number (0–100, default: 50),
  riskLevel:         "low" | "medium" | "high",
}
// Unique: { companyId, employeeId }
// Unique: { companyId, email }
```

### EmployeeIncident

```typescript
{
  companyId:    ObjectId,
  employeeId:   ObjectId,
  incidentType: ObjectId → IncidentType,
  severity:     "positive" | "minor" | "major" | "critical",
  description:  String,
  occurredAt:   Date,
  reportedBy:   ObjectId → User,
}
```

---

## 9. Backend API Reference

> Base URL (local): `http://localhost:5000`  
> Base URL (prod): `https://trustlayer-backend-d3as.onrender.com`

### Auth Routes (`/api/auth`)

| Method | Endpoint | Body | Auth | Description |
|---|---|---|---|---|
| `POST` | `/api/auth/login` | `{ email, password }` | ❌ | Direct dashboard login. Returns JWT + `user` (with `companyName`) |
| `GET` | `/api/auth/me` | — | ✅ Bearer | Returns current user profile + `companyName` + plan |
| `POST` | `/api/auth/sso` | `{ email, name, planName, licenseId, companyName }` | ❌ | Issues JWT for landing-page users. Creates company+user if new |

### Company Routes (`/api/company`)

| Method | Endpoint | Body | Auth | Description |
|---|---|---|---|---|
| `POST` | `/api/company/register` | `{ companyName, companyCode, name, email, password }` | ❌ | Creates Company + superadmin User directly |

### Dashboard Data Routes (`/api/trustlayer`) — All require Bearer token

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/trustlayer/all` | All candidates for logged-in company (scoped by `companyId`) |
| `GET` | `/api/trustlayer/:applicationId` | Single candidate profile with full score breakdown |
| `POST` | `/api/trustlayer/sync` | Sync candidate from recruitment API into local DB |

### LMS Proxy Routes (`/api/lms`)

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `POST` | `/api/lms/login` | `{ email, password }` | Proxy to LMS customer login |
| `POST` | `/api/lms/register` | `{ name, email, password, companyName }` | Sync to LMS **+ create Company & User in MongoDB** |
| `GET` | `/api/lms/active-license/:email` | — | Fetch user's active license plan |
| `GET` | `/api/lms/plans` | — | Get all available subscription plans |
| `POST` | `/api/lms/webhook` | LMS event payload | Auto-update company subscription plan on license activation |
| `POST` | `/api/lms/password-sync` | `{ email, passwordHash }` | Sync password change to LMS |

### HR Feedback Routes (`/api/hr-feedback`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/hr-feedback` | Submit HR feedback for a candidate (no auth required) |
| `GET` | `/api/hr-feedback/:applicationId` | Get feedback for a candidate |

### Employee Routes (`/api/employees`) — Require Bearer token

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/employees` | List all employees for company |
| `POST` | `/api/employees` | Add new employee |
| `PUT` | `/api/employees/:id` | Update employee |
| `DELETE` | `/api/employees/:id` | Deactivate employee |

### Other Routes

| Route | Description |
|---|---|
| `GET /api/trustscore/:applicationId` | Recalculate trust score |
| `GET /api/trust-explain/:applicationId` | AI explanation of score |
| `GET /api/incident-types` | List incident categories |
| `POST /api/razorpay/create-order` | Create Razorpay payment order |
| `POST /api/razorpay/verify` | Verify Razorpay payment signature |

---

## 10. Trust Score Algorithm

### Formula

```
Final Trust Score = Interaction Score × 0.6 + HR Score × 0.4
```

When no HR feedback is available:

```
Final Trust Score = Interaction Score
```

### Ghosting Penalty

```
If isGhosting === true:
  Interaction Score -= 20
```

### Risk Level Mapping

| Trust Score | Risk Level |
|---|---|
| ≥ 80 | 🟢 Low |
| 60–79 | 🟡 Moderate |
| < 60 | 🔴 High |

### Weights (constants in `calculateTrustMetrics.ts`)

```typescript
INTERACTION_WEIGHT = 0.6
HR_WEIGHT          = 0.4
GHOSTING_PENALTY   = 20
```

### Engagement Score Calculation (`calculateInteractionMetrics.ts`)

Normalised score (0–1) computed from:
- Email open count
- Link click count
- Time to first interaction (in seconds)
- Recency of last interaction

---

## 11. Frontend Components

### Landing Page Components

| Component | Purpose |
|---|---|
| `HeroSection.tsx` | Above-the-fold landing hero with CTA |
| `FloatingNavbar.tsx` | Sticky nav with Login/Register modal trigger |
| `FeaturesSection.tsx` | 6-feature card grid |
| `AITrustEngine.tsx` | Animated explainer of the AI engine |
| `DashboardShowcase.tsx` | Live dashboard preview |
| `PricingSection.tsx` | 4-tier pricing cards |
| `CheckoutModal.tsx` | Plan purchase flow with Razorpay |
| `HowItWorks.tsx` | 3-step onboarding walkthrough |
| `TrustAnalytics.tsx` | Analytics preview charts |
| `FAQSection.tsx` | Collapsible FAQ accordion |
| `ContactSupport.tsx` | Support contact form |
| `Footer.tsx` | Site footer with links |
| `LoginPage.tsx` | **Login + Registration form (with Company Name field)** |

### Dashboard Components

| Component | Purpose |
|---|---|
| `AuthContext.tsx` | Global auth state — `user`, `companyName`, `planName` |
| `Header.tsx` | Top nav — shows company name in profile modal |
| `Dashboard.tsx` | Main candidate table with trust scores |
| `DashboardInsights.tsx` | Score trend charts |
| `SummaryCards.tsx` | Top-line KPI cards (total, ghosting count, avg score) |

---

## 12. Environment Variables

### Dashboard Backend (`.env`)

```env
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-jwt-secret-here
NODE_ENV=development

# External APIs
RECRUITMENT_API_URL=https://your-recruitment-api.com
GHOSTING_API_KEY=your-ghosting-api-key
LMS_BASE=https://license-system-v6ht.onrender.com
LMS_API_KEY=my-secret-key-123
TL_WEBHOOK_SECRET=tl-trustlayer-secret-2024-xK9mP3qR

# CORS
FRONTEND_URL=http://localhost:5174

# Payment
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
```

### Landing Page (`.env`)

```env
VITE_BACKEND_URL=https://trustlayer-backend-d3as.onrender.com
VITE_DASHBOARD_URL=https://trustlayer-frontend.onrender.com
```

---

## 13. Local Development Setup

### Prerequisites

- Node.js 18+
- MongoDB (or MongoDB Atlas connection string)
- Git

### Step 1: Start Dashboard Backend

```bash
cd C:\Users\ADMIN\Documents\trustlayer-dashboard-temp\backend
npm install
npm run dev      # starts on port 5000
```

### Step 2: Start Dashboard Frontend

```bash
cd C:\Users\ADMIN\Documents\trustlayer-dashboard-temp\frontend
npm install
npm run dev      # starts on port 5174
```

### Step 3: Start Landing Page

```bash
cd C:\Users\ADMIN\Documents\trustlayer
npm install
npm run dev      # starts on port 5173
```

### Local URLs

| Service | URL |
|---|---|
| Landing Page | http://localhost:5173 |
| Dashboard | http://localhost:5174 |
| Backend API | http://localhost:5000 |
| Health Check | http://localhost:5000/ |

---

## 14. Deployment (Render)

All services are deployed on [Render.com](https://render.com) via `render.yaml`.

| Service | Type | URL |
|---|---|---|
| Landing Page | Static Site | https://trustlayer-by3p.onrender.com |
| Dashboard Frontend | Static Site | https://trustlayer-frontend.onrender.com |
| Dashboard Backend | Web Service | https://trustlayer-backend-d3as.onrender.com |

---

## 15. Git Repositories

| Project | GitHub Repo |
|---|---|
| Landing Page | https://github.com/kunalaverlonworld/TrustLayer |
| Dashboard (FE + BE) | https://github.com/kunalaverlonworld/TrustLayer-Dashboard |

### Branching

- `main` — production branch. All features are merged directly to `main`.

---

## 16. Security Measures

| Measure | Detail |
|---|---|
| **Helmet.js** | Sets secure HTTP headers on all responses |
| **CORS Whitelist** | Only allows requests from known origins |
| **Rate Limiting** | 200 req/15min (prod), 500 req/15min (dev) per IP |
| **HPP** | HTTP Parameter Pollution protection |
| **bcrypt** | All passwords hashed with salt rounds = 10 |
| **JWT** | Stateless auth — no sessions stored server-side |
| **Password never exposed** | `passwordHash` field uses `select: false` in Mongoose; login response explicitly `delete`s it |
| **Multi-tenant isolation** | All DB queries scoped by `companyId` from JWT |
| **401 on unauthenticated** | All dashboard data routes require valid Bearer token |

---

## 17. Changes Made in This Session

This section documents all code changes made by the Antigravity AI assistant.

### Backend Changes (`trustlayer-dashboard-temp`)

#### `backend/src/routes/auth.ts`

| Change | Reason |
|---|---|
| `/login` now fetches `Company` and appends `companyName` to user object | Dashboard header needed to show company name |
| `/login` now deletes `passwordHash` before returning response | Security — was accidentally leaking hashed password |
| `/me` now fetches `Company` and appends `companyName` | AuthContext refresh needed company name |
| `/sso` creates a unique `Company` record using `companyName` from landing page | Multi-tenant isolation — each registered company gets own DB space |
| `/sso` handles both new and existing users idempotently | Safe for repeated SSO calls |

#### `backend/src/routes/trustLayer.ts`

| Change | Reason |
|---|---|
| Added `authenticate` middleware to `GET /all` and `GET /:id` | Routes were previously unauthenticated |
| `GET /all` scopes local DB query by `companyId` from JWT | Multi-tenant data isolation |
| `GET /all` filters external API response by `companyName` matching the company in DB | Ensures companies only see their own candidates |

#### `backend/src/routes/lmsProxy.ts`

| Change | Reason |
|---|---|
| `POST /register` now also creates `Company` + `User` in MongoDB after LMS sync | **Key fix**: user was only appearing in backend DB after first SSO visit. Now created immediately at registration |
| Company creation is idempotent (finds existing before creating) | Safe for re-registration attempts |
| DB errors in this step are non-fatal | LMS registration UX is not broken if DB write fails |

### Frontend Changes (`trustlayer-dashboard-temp`)

#### `frontend/src/components/auth/AuthContext.tsx`

- Added `companyName?: string` to the `User` interface

#### `frontend/src/components/core/Header.tsx`

- Profile modal now shows **Company Name** field using `user.companyName`

#### `frontend/src/components/dashboard/Dashboard.tsx`

- Page title now shows **`"[Company Name] Trust Dashboard"`** dynamically

### Landing Page Changes (`trustlayer`)

#### `src/app/components/LoginPage.tsx`

- Added **Company Name** input field to the registration form
- Company Name is passed to `authService.ts` on registration

#### `src/app/services/authService.ts`

- `lmsRegister()` now forwards `companyName` in the request body to `/api/lms/register`
- `triggerSSORedirect()` includes `companyName` in the SSO request body

#### `src/app/App.tsx`

- Persists `companyName` to `localStorage` after login
- Recovers `companyName` from `localStorage` on app mount

---

*This documentation was auto-generated by Antigravity AI and reflects the state of the codebase as of June 11, 2026.*
