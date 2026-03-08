# TeamBoard

A collaborative project management application built with Next.js 15, featuring real-time updates, drag-and-drop functionality, and comprehensive workspace management.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fworkermill-examples%2Fteamboard)

**🌐 Live Demo:** [teamboard.workermill.com](https://teamboard.workermill.com)

## Features

- **🏢 Multi-tenant Workspaces** - Create and manage multiple team workspaces
- **📋 Kanban Boards** - Drag-and-drop cards with real-time updates
- **👥 Role-based Access Control** - Owner, Admin, Member, and Viewer roles
- **📊 Dashboard Analytics** - Visual charts and project insights
- **💬 Activity Feeds** - Track all workspace activity in real-time
- **🏷️ Labels & Priorities** - Organize cards with custom labels and priorities
- **✅ Checklists** - Break down tasks with completion tracking
- **📱 Progressive Web App** - Install and use offline on any device
- **🔐 Secure Authentication** - NextAuth.js v5 with bcrypt encryption
- **🚀 Real-time Updates** - Server-Sent Events for instant collaboration

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | Next.js (App Router) | 15 |
| **Language** | TypeScript | 5 |
| **Database** | PostgreSQL | 16 |
| **ORM** | Prisma | 6.1+ |
| **Authentication** | NextAuth.js v5 | 5.0.0-beta.25 |
| **Styling** | TailwindCSS v4 | 4.0+ |
| **Drag & Drop** | @dnd-kit/core | 6.1+ |
| **Charts** | Recharts | 2.12+ |
| **Animation** | Framer Motion | 11.11+ |
| **Real-time** | Server-Sent Events | Native |
| **Testing** | Vitest + Playwright | Latest |
| **Deployment** | Vercel | - |
| **Database Hosting** | Neon PostgreSQL | Free tier |

## Quick Start

### Prerequisites

- Node.js 18+ (engines requirement in package.json)
- Docker and Docker Compose
- PostgreSQL 16 (via Docker)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/workermill-examples/teamboard.git
   cd teamboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start PostgreSQL**
   ```bash
   docker compose up -d
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your configuration (see [Environment Configuration](#environment-configuration))

5. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate

   # Push database schema
   npm run db:push

   # Seed development data (optional)
   npm run db:seed
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

7. **Open the application**

   Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Configuration

Copy `.env.example` to `.env.local` and configure the following variables:

```bash
# Database
DATABASE_URL="postgresql://teamboard:teamboard@localhost:5432/teamboard"
DIRECT_DATABASE_URL="postgresql://teamboard:teamboard@localhost:5432/teamboard"

# NextAuth.js
NEXTAUTH_SECRET="your-secure-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
AUTH_TRUST_HOST="true"

# Development Seeding
SEED_TOKEN="your-secure-seed-token-here"
```

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string (pooled) | ✅ | - |
| `DIRECT_DATABASE_URL` | PostgreSQL direct connection (migrations) | ✅ | - |
| `NEXTAUTH_SECRET` | NextAuth.js encryption secret | ✅ | - |
| `NEXTAUTH_URL` | Application URL | ✅ | http://localhost:3000 |
| `AUTH_TRUST_HOST` | Trust host header (Vercel) | ✅ | true |
| `SEED_TOKEN` | API token for seeding data | ⚠️ | - |

⚠️ **Required for production deployment**

## Demo Credentials

The application includes demo data for testing:

- **Email:** demo@workermill.com
- **Password:** demo1234

The demo workspace includes:
- 3 sample boards with realistic project data
- 30 cards distributed across different columns
- Sample team members and activity history
- Various labels, priorities, and due dates

## Available Scripts

### Development

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |

### Testing

| Command | Description |
|---------|-------------|
| `npm run test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:e2e` | Run E2E tests with Playwright |

### Database

| Command | Description |
|---------|-------------|
| `npm run db:push` | Push schema changes to database |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:seed` | Seed development data |

## Architecture Overview

### Database Schema

The application uses a comprehensive Prisma schema with the following key models:

- **User Management** - NextAuth.js integration with secure authentication
- **Workspace Organization** - Multi-tenant workspaces with role-based access
- **Board Hierarchy** - Workspaces → Boards → Columns → Cards
- **Collaboration** - Comments, activity tracking, and real-time updates
- **Organization** - Labels, checklists, priorities, and due dates

### API Architecture

RESTful API endpoints following consistent patterns:

```
/api/auth/           - Authentication (NextAuth.js)
/api/workspaces/     - Workspace management
/api/boards/         - Board operations
/api/cards/          - Card CRUD and updates
/api/.../stream/     - Server-Sent Events for real-time updates
```

### Authentication Flow

- **NextAuth.js v5** with JWT strategy
- **Credentials provider** with bcrypt password hashing
- **Prisma adapter** for session management
- **Edge-safe configuration** split for middleware compatibility

### Real-time Features

Server-Sent Events implementation:
- **Endpoint:** `/api/workspaces/[slug]/stream`
- **Polling:** PostgreSQL every 1-2 seconds
- **Keep-alive:** Every 20 seconds
- **Events:** Card/board creation, updates, moves, deletions

## Deployment

### Production Environment

The application is deployed at [teamboard.workermill.com](https://teamboard.workermill.com) using:

- **Hosting:** Vercel (automatic deployments)
- **Database:** Neon PostgreSQL (serverless with connection pooling)
- **Domain:** Custom domain with SSL
- **CDN:** Vercel Edge Network

### Deployment Configuration

#### Vercel Settings

- **Runtime:** Node.js 22
- **Build Command:** `npm run build`
- **Output Directory:** `.next` (standalone)
- **Install Command:** `npm ci`

#### Required Environment Variables (Production)

```bash
DATABASE_URL=         # Neon pooled connection
DIRECT_DATABASE_URL=  # Neon direct connection
NEXTAUTH_SECRET=      # Cryptographically secure random string
NEXTAUTH_URL=         # https://teamboard.workermill.com
AUTH_TRUST_HOST=      # true
SEED_TOKEN=           # Secure token for API seeding
```

### CI/CD Pipeline

GitHub Actions workflow includes:

1. **Quality Checks**
   - ESLint validation
   - TypeScript compilation
   - Build verification
   - Unit test execution
   - Security audit

2. **E2E Testing**
   - Playwright tests on multiple browsers
   - Real database integration
   - Visual regression testing

3. **Deployment**
   - Automatic deployment to Vercel on main branch
   - Database schema migration
   - Production data seeding

## Development Guidelines

### Code Standards

- **TypeScript Strict Mode** - No `any` types (except Prisma JsonValue)
- **ESLint Configuration** - Next.js recommended + strict rules
- **Prettier Formatting** - Consistent code formatting
- **Import Organization** - Absolute imports with `@/` prefix

### Next.js 15 Requirements

- **Route Parameters:** Must use `Promise<{...}>` syntax and `await params`
- **Suspense Boundaries:** Required for `useSearchParams()` and `usePathname()`
- **Edge Runtime Split:** Auth configuration separated for middleware compatibility

### Database Conventions

- **Idempotent Operations:** Use `findFirst` + conditional `create`
- **Field Naming:** `password` (not passwordHash), `avatar` (not avatarUrl)
- **JSON Fields:** Label colors as hex strings, not enums
- **Migrations:** Always use `DIRECT_DATABASE_URL` for schema changes

### Testing Strategy

- **Unit Tests:** Vitest with real PostgreSQL container
- **Integration Tests:** Full API testing with actual database
- **E2E Tests:** Playwright with multiple browser/device configurations
- **No Mocking:** Tests run against real service dependencies

## Security

### Authentication & Authorization

- **Password Security:** bcrypt with 12+ rounds
- **Session Management:** NextAuth.js JWT strategy
- **Role-based Access:** OWNER > ADMIN > MEMBER > VIEWER hierarchy
- **Input Validation:** Zod schemas for all user inputs

### Security Headers

Production deployment includes security headers:

```javascript
{
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block"
}
```

### Best Practices

- No secrets in code or git history
- Environment variables for all configuration
- Regular dependency updates and security audits
- CSP headers for XSS protection

## Progressive Web App

### PWA Features

- **Installable:** Home screen installation on mobile/desktop
- **Offline Support:** View recently accessed boards when offline
- **Service Worker:** Cache-first static assets, network-first API calls
- **App Manifest:** Comprehensive manifest with icons and shortcuts

### Mobile Experience

- **Responsive Design:** 320px to 1440px+ breakpoints
- **Touch Interactions:** Long-press drag, swipe gestures
- **iOS Integration:** Safe areas, status bar styling
- **Android Integration:** Themed address bar, splash screens

## Performance

### Optimization Features

- **Next.js Standalone Output** - Minimal production bundle
- **Static Asset Optimization** - Automatic image optimization
- **Code Splitting** - Route-based lazy loading
- **Database Optimization** - Prisma query optimization and connection pooling

### Monitoring

- **Lighthouse CI** - Automated performance audits
- **Performance Targets** - >90 performance score on mobile
- **Core Web Vitals** - LCP <2.5s, FID <100ms, CLS <0.1

## Troubleshooting

### Common Issues

#### Database Connection
```bash
# Ensure PostgreSQL is running
docker compose up -d

# Check container status
docker compose ps
```

#### Prisma Client
```bash
# Regenerate client after schema changes
npm run db:generate

# Reset and reseed database
npm run db:push && npm run db:seed
```

#### Authentication Issues
```bash
# Verify environment variables
cat .env.local

# Check NextAuth.js secret is set
echo $NEXTAUTH_SECRET
```

#### Build Failures
```bash
# Run type checking
npm run typecheck

# Clear Next.js cache
rm -rf .next && npm run build
```

### Development Tools

- **Prisma Studio:** `npm run db:studio` - Visual database browser
- **Database Logs:** `docker compose logs postgres` - PostgreSQL logs
- **Next.js Debugging:** Built-in development error overlay

## Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch from `main`
3. Make your changes following the code standards
4. Run the full test suite:
   ```bash
   npm run lint && npm run typecheck && npm run build && npm run test
   ```
5. Run E2E tests:
   ```bash
   npx playwright install --with-deps chromium
   npm run test:e2e
   ```
6. Submit a pull request

### Pull Request Requirements

- All quality checks must pass
- E2E tests must pass
- Code must follow established patterns
- Documentation updates for new features

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Built with WorkerMill

This application showcases [WorkerMill](https://workermill.com)'s AI-powered development capabilities. WorkerMill AI Workers built this entire application following enterprise-grade patterns and best practices.

---

**Questions?** Open an issue or contact [support@workermill.com](mailto:support@workermill.com)