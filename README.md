# Crucible — Design it. Ship it. Defend it.

An engineering simulation and training platform for distributed systems architecture, concurrency defect auditing, and incident response.

---

## ⚡ Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Canvas / Topology**: React Flow (`reactflow`)
- **Code Review / Diff**: Monaco Editor & custom unified diff line annotator
- **Auth**: Auth.js v5 (NextAuth) with Google + GitHub OAuth & Email/Password Credentials
- **Database / ORM**: PostgreSQL (Supabase) + Prisma ORM
- **Styling**: High-contrast monochrome black & white engineering aesthetic

---

## 📁 Repository Structure

```
.
├── .gitignore                   # Monorepo gitignore (blocks secrets, builds, caches)
├── .env.example                 # Template for required environment variables
├── package.json                 # Monorepo root workspace scripts
├── apps/
│   ├── web/                     # Next.js 15 Full-Stack Web Application
│   │   ├── prisma/
│   │   │   ├── schema.prisma    # PostgreSQL domain schema (User, Project, PR, Review, SkillProfile)
│   │   │   └── migrations/      # Version-controlled database migrations
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── (auth)/      # Login and Signup authentication portals
│   │   │   │   ├── (protected)/ # Dashboard, Design Canvas, Code Review, Incidents, Profile
│   │   │   │   ├── api/         # Next.js API route handlers (Auth, Projects, Simulation, Reviews)
│   │   │   │   ├── globals.css  # Tailwind CSS theme configurations
│   │   │   │   └── layout.tsx   # Root layout with dark mode
│   │   │   ├── components/      # Architecture canvas nodes, diff viewer, navigation header
│   │   │   └── lib/             # Prisma client singleton, NextAuth configuration, utilities
│   │   └── package.json
│   └── sim-engine/              # Python FastAPI discrete-event simulation engine (SimPy)
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18.x or higher
- Supabase PostgreSQL Database URL

### 2. Environment Setup
Create `apps/web/.env` by copying `.env.example`:
```bash
cp .env.example apps/web/.env
```
Fill in your `DATABASE_URL`, `DIRECT_URL`, and `AUTH_SECRET`.

### 3. Install Dependencies & Run
From the root directory:
```bash
# Install dependencies
npm --prefix apps/web install

# Run database migrations
npx --prefix apps/web prisma migrate dev

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
