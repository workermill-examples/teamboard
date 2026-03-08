# Production Environment Validation Checklist

This checklist ensures TeamBoard is properly configured for production deployment at `teamboard.workermill.com`.

## ✅ Pre-Deployment Checklist

### Environment Variables Configuration

#### Required Environment Variables
- [ ] `NEXTAUTH_URL` set to `https://teamboard.workermill.com`
- [ ] `AUTH_TRUST_HOST` set to `true`
- [ ] `DATABASE_URL` points to Neon pooled connection string
- [ ] `DIRECT_DATABASE_URL` points to Neon direct connection string
- [ ] `SEED_TOKEN` configured with secure production token
- [ ] `NEXTAUTH_SECRET` set to cryptographically secure random string (min 32 chars)

#### Environment Variable Validation
```bash
# Verify environment variables are set in Vercel dashboard
# ❌ DO NOT run these commands with actual production values in logs

echo "Checking NEXTAUTH_URL format..."
# Should be: https://teamboard.workermill.com

echo "Checking DATABASE_URL format..."
# Should contain: postgresql://[user]:[password]@[host]/[database]?[params]

echo "Checking DIRECT_DATABASE_URL format..."
# Should contain: postgresql://[user]:[password]@[host]/[database]?[params]
```

### Database Configuration

#### Neon PostgreSQL Setup
- [ ] Database created in Neon console
- [ ] Connection pooling enabled (recommended: PgBouncer)
- [ ] Pooled connection string configured for `DATABASE_URL`
- [ ] Direct connection string configured for `DIRECT_DATABASE_URL`
- [ ] Database schema migrated to latest version
- [ ] Database accessible from Vercel deployment region

#### Database Connectivity Test
```bash
# Test database connectivity (run locally with production env vars)
npm run db:generate
npx prisma db push --accept-data-loss # ⚠️ Only for fresh production deployment
```

### Application Build Verification

#### Pre-Deploy Build Check
- [ ] All TypeScript compilation errors resolved
- [ ] ESLint warnings/errors resolved
- [ ] Build process completes successfully
- [ ] No security vulnerabilities in dependencies

#### Build Commands
```bash
# Run full quality gate locally before deployment
npm run lint
npm run typecheck
npm run build
npm run test
npm audit --audit-level=high
```

### Security Configuration

#### Authentication Security
- [ ] `NEXTAUTH_SECRET` is production-secure random string (not development value)
- [ ] bcrypt salt rounds configured appropriately (12+)
- [ ] JWT token expiration configured
- [ ] Session security configured

#### API Security
- [ ] CORS properly configured for production domain
- [ ] Rate limiting implemented (if applicable)
- [ ] Input validation active on all endpoints
- [ ] SQL injection protection via Prisma ORM

#### Headers Security
- [ ] Security headers configured in `vercel.json`:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`

## 🚀 Post-Deployment Validation

### Deployment Verification

#### Core Application Health
- [ ] Application loads at `https://teamboard.workermill.com`
- [ ] Landing page renders correctly
- [ ] No JavaScript console errors
- [ ] All static assets load (CSS, JS, images)
- [ ] Service Worker registers successfully

#### Authentication Flow
- [ ] Login page accessible at `/login`
- [ ] Signup page accessible at `/signup`
- [ ] Demo credentials work: `demo@workermill.com` / `demo1234`
- [ ] Session persistence works across page refreshes
- [ ] Logout functionality works

#### Database Connectivity
- [ ] Demo data accessible after login
- [ ] Workspace dashboard loads with data
- [ ] Boards load with cards and columns
- [ ] Real-time updates working (SSE endpoint)

### API Endpoints Testing

#### Health Check
```bash
curl https://teamboard.workermill.com/api/health
# Expected: {"status":"ok","timestamp":"..."}
```

#### Seed Data Verification
```bash
curl -X POST https://teamboard.workermill.com/api/seed \
  -H "Authorization: Bearer $SEED_TOKEN"
# Expected: 200 (success) or 409 (already seeded)
```

#### Protected Routes
```bash
# Should return 401 without authentication
curl https://teamboard.workermill.com/api/workspaces
# Expected: {"error":"Unauthorized"}
```

### Performance Validation

#### Core Web Vitals
- [ ] Lighthouse Performance Score >90 (mobile)
- [ ] First Contentful Paint <2s
- [ ] Largest Contentful Paint <2.5s
- [ ] Cumulative Layout Shift <0.1
- [ ] Total Blocking Time <300ms

#### PWA Validation
- [ ] PWA installable (manifest.json accessible)
- [ ] Service worker registers
- [ ] Offline functionality works
- [ ] App icons display correctly
- [ ] Add to Home Screen works on mobile

### Monitoring Setup

#### Error Tracking
- [ ] Application errors logged appropriately
- [ ] Database connection errors monitored
- [ ] API response times tracked

#### Uptime Monitoring
- [ ] Health check endpoint monitored
- [ ] Critical user paths monitored
- [ ] Database availability monitored

## 🔧 Production Maintenance

### Data Seeding

#### Initial Production Data
```bash
# Run after successful deployment
curl -X POST https://teamboard.workermill.com/api/seed \
  -H "Authorization: Bearer $SEED_TOKEN" \
  -H "Content-Type: application/json"
```

#### Seed Data Verification
```bash
# Verify expected card count matches
npm run verify-seed
# Should confirm EXPECTED_CARDS=30
```

### Database Maintenance

#### Schema Migrations
```bash
# For future schema changes
npx prisma migrate deploy
# Uses DIRECT_DATABASE_URL for migrations
```

#### Backup Verification
- [ ] Neon automated backups enabled
- [ ] Point-in-time recovery available
- [ ] Backup restoration tested

### Security Monitoring

#### Regular Security Audits
```bash
# Run monthly or after dependency updates
npm audit
npm audit --audit-level=high
```

#### Access Control Review
- [ ] Workspace access permissions working
- [ ] Role-based access control enforced
- [ ] Admin-only functions protected

## 🚨 Troubleshooting

### Common Issues

#### Application Won't Load
1. Check Vercel deployment logs
2. Verify environment variables set correctly
3. Confirm domain DNS pointing to Vercel
4. Check for build failures in deployment

#### Database Connection Issues
1. Verify Neon database is running
2. Check connection string format
3. Confirm Vercel has database access
4. Test connection from Vercel function

#### Authentication Problems
1. Verify `NEXTAUTH_SECRET` is set
2. Check `NEXTAUTH_URL` matches deployment URL
3. Confirm `AUTH_TRUST_HOST=true` for Vercel
4. Test with demo credentials

#### Performance Issues
1. Check Lighthouse scores
2. Monitor Core Web Vitals
3. Review database query performance
4. Check for memory leaks in SSE connections

### Emergency Procedures

#### Rollback Process
1. Revert to previous Git commit
2. Re-deploy via Vercel dashboard
3. Verify application functionality
4. Communicate status to stakeholders

#### Database Recovery
1. Use Neon point-in-time recovery
2. Re-run seed script if needed
3. Verify data integrity
4. Test critical user flows

## 📊 Success Criteria

### Performance Targets
- [ ] Lighthouse Performance: >90 (mobile)
- [ ] Lighthouse PWA: 100% pass rate
- [ ] Application load time: <3s initial
- [ ] API response time: <500ms average

### Functionality Targets
- [ ] Demo user can sign in successfully
- [ ] All workspace features functional
- [ ] Real-time updates working
- [ ] Drag-and-drop operations smooth
- [ ] Mobile experience polished

### Reliability Targets
- [ ] 99.9% uptime (Vercel SLA)
- [ ] Zero critical security vulnerabilities
- [ ] Database connection stability
- [ ] Error rate <0.1% for critical flows

---

**Last Updated:** {current_date}
**Next Review:** {next_monthly_review_date}

> **Note:** This checklist should be reviewed and updated with each deployment. Any failures should be documented and addressed before proceeding to production.