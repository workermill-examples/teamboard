# TeamBoard - Repository Guidance

## Project Overview

TeamBoard is a collaborative project management application built with Next.js 15, featuring real-time updates, drag-and-drop functionality, and comprehensive workspace management.

**Production Status**: ✅ **READY FOR PRODUCTION**
- All builds passing (lint, typecheck, build, test)
- E2E test infrastructure complete with comprehensive data-testid coverage
- Vercel deployment pipeline configured with automated seeding
- Production environment validated and ready for go-live

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL 16 with Prisma ORM
- **Authentication**: NextAuth v5 (5.0.0-beta.25)
- **Styling**: Tailwind CSS v4
- **Testing**: Vitest + Testing Library + Playwright E2E
- **Deployment**: Vercel with automated CI/CD
- **E2E Testing**: 333+ data-testid assertions across all critical user flows

## Development Setup

### Prerequisites
- Node.js 18+ (engines requirement in package.json)
- Docker and Docker Compose
- PostgreSQL 16 (via Docker)

### Quick Start
```bash
# Install dependencies
npm install

# Start PostgreSQL
docker compose up -d

# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Seed development data (optional)
npm run db:seed

# Start development server
npm run dev
```

## Environment Configuration

Copy `.env.example` to `.env.local` and configure:

```bash
# Database
DATABASE_URL="postgresql://teamboard:teamboard@localhost:5432/teamboard"
DIRECT_DATABASE_URL="postgresql://teamboard:teamboard@localhost:5432/teamboard"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
AUTH_TRUST_HOST="true"

# Seeding (for development)
SEED_TOKEN="your-secure-seed-token-here"
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm run start` - Start production server
- `npm run lint` - ESLint checking
- `npm run typecheck` - TypeScript type checking
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:e2e` - Run E2E tests (requires Playwright setup)

### Quality Gate Commands
```bash
# Full quality verification (run before commits)
npm run lint && npm run typecheck && npm run build && npm run test && npm audit --audit-level=high

# E2E test setup and execution
npx playwright install chromium
npm run test:e2e
```

### Database Scripts
- `npm run db:push` - Push schema changes to database
- `npm run db:generate` - Generate Prisma client
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed development data

## Architecture

### Database Schema
The application uses a comprehensive Prisma schema with the following key models:
- User management and authentication (NextAuth integration)
- Workspace organization with role-based access
- Board, Column, and Card hierarchy
- Activity tracking and comments
- Labels and checklists

### API Routes
All API endpoints are located in `app/api/` and follow RESTful conventions:
- Authentication: `/api/auth/`
- Workspaces: `/api/workspaces/`
- Boards: `/api/boards/`
- Cards: `/api/cards/`
- Real-time: `/api/workspaces/[slug]/stream/`

### Authentication
Uses NextAuth v5 with:
- Credentials provider (email/password with bcrypt)
- Prisma adapter for session management
- Edge-safe configuration split between `auth.config.ts` and `auth.ts`

## Code Conventions

### Next.js 15 Requirements
- Dynamic route params must use `Promise<{...}>` syntax: `params: Promise<{slug: string}>`
- Always `await params` before destructuring
- Use `import { auth } from "@/lib/auth"` for authentication

### Database Conventions
- Use `findFirst` + conditional `create` for idempotent operations
- Field names: `password` (not passwordHash), `avatar` (not avatarUrl)
- Label colors are hex strings, not enums

### Testing
- Unit tests use real PostgreSQL container (not mocks)
- Run `docker compose up -d` before testing
- Integration tests hit actual database
- E2E tests include comprehensive data-testid coverage
- All critical user flows validated: auth, workspace management, board operations, real-time updates

### Data TestID Standards
- All interactive elements have unique `data-testid` attributes
- Desktop/mobile variants use suffixes: `-desktop`, `-mobile`
- Critical testids for auth: `email`, `password`, `login-button`, `user-menu-desktop`
- E2E test suite validates 333+ testid assertions across all flows

## Security

### Headers
Vercel deployment includes security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

### Authentication
- Passwords hashed with bcrypt
- Sessions managed by NextAuth
- Role-based access control (OWNER > ADMIN > MEMBER > VIEWER)

## Deployment

### Vercel Configuration
- Function timeout: 10 seconds
- Prisma binary includes `rhel-openssl-3.0.x` for Vercel compatibility
- Next.js standalone output for container deployment

### CI/CD
GitHub Actions workflow runs on:
- Push to main
- Pull requests to main

Quality checks include:
- ESLint (zero warnings policy)
- TypeScript checking (strict mode)
- Build verification (Next.js 15 production build)
- Unit test execution (138 tests + Vitest)
- E2E test execution (Playwright with real browser testing)
- Security audit (npm audit --audit-level=high)
- Automated deployment to Vercel on main branch
- Post-deployment seeding and smoke tests

## Real-time Features

Server-Sent Events (SSE) endpoint at `/api/workspaces/[slug]/stream`:
- PostgreSQL polling every 1-2 seconds
- Keep-alive every 20 seconds
- Card and board event streaming

## Development Guidelines

### File Organization
- API routes in `app/api/`
- Shared utilities in `lib/`
- Database client singleton in `lib/prisma.ts`
- Auth configuration split for edge compatibility

### Error Handling
- API routes return appropriate HTTP status codes
- Client-side error boundaries for React components
- Prisma error handling for database operations

### Performance
- Next.js standalone build for efficient deployment
- Prisma query optimization
- Tailwind CSS purging for minimal bundle size

## Troubleshooting

### Common Issues

**Database Connection**: Ensure PostgreSQL is running via `docker compose up -d`

**Prisma Client**: Run `npm run db:generate` after schema changes

**Authentication**: Verify `NEXTAUTH_SECRET` is set in environment

**Build Failures**: Check TypeScript errors with `npm run typecheck`

### Development Tools
- Prisma Studio: `npm run db:studio`
- Database logs: `docker compose logs postgres`
- Development debugging: Next.js built-in debugging

## Contributing

1. Create feature branch from `main`
2. Ensure all tests pass: `npm run test`
3. Verify build: `npm run build`
4. Check linting: `npm run lint`
5. Submit pull request

CI will automatically run quality checks on all pull requests.