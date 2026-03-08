# Vercel Project Settings Verification

This document outlines the required Vercel project configuration for TeamBoard production deployment.

## 🎯 Project Overview

- **Project Name:** teamboard
- **Domain:** teamboard.workermill.com
- **Framework:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm ci`
- **Node.js Version:** 22

## ⚙️ General Settings

### Project Configuration

| Setting | Value | Required |
|---------|-------|----------|
| **Framework Preset** | Next.js | ✅ |
| **Root Directory** | `./` | ✅ |
| **Build Command** | `npm run build` | ✅ |
| **Output Directory** | `.next` | ✅ |
| **Install Command** | `npm ci` | ✅ |
| **Development Command** | `npm run dev` | ✅ |

### Node.js Runtime

| Setting | Value | Required |
|---------|-------|----------|
| **Node.js Version** | 22 | ✅ |
| **Package Manager** | npm | ✅ |
| **Enable Corepack** | false | ✅ |

> **Note:** Node.js 22 is required to match the project's `engines` field and CI configuration.

## 🌍 Environment Variables

### Production Environment Variables

| Variable | Required | Value Format | Example |
|----------|----------|--------------|---------|
| `DATABASE_URL` | ✅ | postgresql://user:pass@host/db | postgresql://...@host.neon.tech/teamboard |
| `DIRECT_DATABASE_URL` | ✅ | postgresql://user:pass@host/db | postgresql://...@host.neon.tech/teamboard |
| `NEXTAUTH_SECRET` | ✅ | Random string (32+ chars) | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | ✅ | https://teamboard.workermill.com | https://teamboard.workermill.com |
| `AUTH_TRUST_HOST` | ✅ | true | true |
| `SEED_TOKEN` | ✅ | Random string (32+ chars) | `openssl rand -base64 32` |

### Environment Variable Sources

```bash
# Generate secure secrets for production
NEXTAUTH_SECRET=$(openssl rand -base64 32)
SEED_TOKEN=$(openssl rand -base64 32)
```

### Environment Variable Verification

```bash
# Check environment variables are set in Vercel dashboard
vercel env ls --environment=production
```

Expected output:
```
NAME                 VALUE     ENVIRONMENT
DATABASE_URL         postgres  Production
DIRECT_DATABASE_URL  postgres  Production
NEXTAUTH_SECRET      [HIDDEN]  Production
NEXTAUTH_URL         https://  Production
AUTH_TRUST_HOST      true      Production
SEED_TOKEN           [HIDDEN]  Production
```

## 🔧 Build & Deployment Settings

### Deployment Configuration

| Setting | Value | Required |
|---------|-------|----------|
| **Auto-deploy** | Enabled (main branch) | ✅ |
| **Production Branch** | main | ✅ |
| **Preview Deployments** | Enabled | ✅ |
| **Comments on PR** | Enabled | ✅ |

### Build Configuration

| Setting | Value | Required |
|---------|-------|----------|
| **Build Command Override** | `npm run build` | ✅ |
| **Install Command Override** | `npm ci` | ✅ |
| **Ignore Build Step** | Disabled | ✅ |
| **Output Directory** | `.next` (auto-detected) | ✅ |

### Function Configuration

| Setting | Value | Required |
|---------|-------|----------|
| **Serverless Functions** | Enabled | ✅ |
| **Edge Functions** | Auto | ✅ |
| **Function Timeout** | 10s (via vercel.json) | ✅ |
| **Function Memory** | 1024 MB | ✅ |

## 🌐 Domains & SSL

### Custom Domain Configuration

| Setting | Value | Required |
|---------|-------|----------|
| **Primary Domain** | teamboard.workermill.com | ✅ |
| **Redirect www to apex** | Disabled | ✅ |
| **SSL Certificate** | Auto (Let's Encrypt) | ✅ |
| **HTTPS Redirect** | Enabled | ✅ |
| **HSTS** | Enabled | ✅ |

### Domain DNS Records

Required DNS configuration for `teamboard.workermill.com`:

```dns
Type: CNAME
Name: teamboard
Value: cname.vercel-dns.com
TTL: Auto
```

Verification:
```bash
# Verify DNS resolution
dig teamboard.workermill.com CNAME
nslookup teamboard.workermill.com
```

## 🔒 Security Settings

### Security Headers

Headers are configured via `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### CORS Configuration

CORS is handled by Next.js API routes. No additional Vercel configuration required.

## 📊 Performance Settings

### Edge Configuration

| Setting | Value | Required |
|---------|-------|----------|
| **Edge Network** | Global | ✅ |
| **Static File Caching** | Auto | ✅ |
| **Serverless Function Regions** | Auto | ✅ |
| **Edge Functions** | Enabled | ✅ |

### Caching Strategy

```javascript
// Configured in next.config.ts
const nextConfig = {
  output: 'standalone',
  compress: true,
  poweredByHeader: false
}
```

## 🔗 Git Integration

### Repository Configuration

| Setting | Value | Required |
|---------|-------|----------|
| **Repository** | workermill-examples/teamboard | ✅ |
| **Git Provider** | GitHub | ✅ |
| **Production Branch** | main | ✅ |
| **Deploy Hooks** | Disabled | ✅ |
| **Auto-deploy** | Enabled | ✅ |

### Branch Protection

GitHub branch protection should be configured:

- Require PR reviews
- Require status checks
- Dismiss stale reviews
- Restrict pushes to main

## 📱 Preview Deployments

### Preview Configuration

| Setting | Value | Required |
|---------|-------|----------|
| **Preview Deployments** | Enabled | ✅ |
| **Comment on PR** | Enabled | ✅ |
| **Password Protection** | Disabled | ✅ |

### Preview Environment Variables

Preview deployments inherit production environment variables but should have:

- Different `DATABASE_URL` (test/staging database)
- Different `NEXTAUTH_URL` (preview deployment URL)
- Same `NEXTAUTH_SECRET` for consistency

## 🚀 Deployment Pipeline

### Automatic Deployment Triggers

1. **Push to main** → Production deployment
2. **Pull request** → Preview deployment
3. **Manual deployment** → Via Vercel dashboard

### Deployment Process

```yaml
# Automatic process on push to main:
1. Git webhook triggers Vercel build
2. npm ci (install dependencies)
3. npm run build (Next.js build)
4. Deploy to Vercel edge network
5. Update DNS and SSL certificates
6. Run post-deploy seed script
```

### Post-Deploy Actions

After successful deployment, the following should happen automatically:

```bash
# Post-deployment seed data
curl -X POST https://teamboard.workermill.com/api/seed \
  -H "Authorization: Bearer $SEED_TOKEN"
```

## 🛠️ Monitoring & Analytics

### Vercel Analytics

| Feature | Status | Required |
|---------|--------|----------|
| **Web Analytics** | Enabled | ✅ |
| **Speed Insights** | Enabled | ✅ |
| **Function Logs** | Enabled | ✅ |
| **Real-time Logs** | Enabled | ✅ |

### Performance Monitoring

Lighthouse CI should run automatically on deployments:

- Performance score >90
- PWA compliance 100%
- Accessibility >90
- Best practices >90

## 🔍 Verification Commands

### Project Status Check

```bash
# Verify project exists and is configured correctly
vercel projects ls | grep teamboard

# Check current deployment status
vercel deployments ls --project=teamboard

# Verify environment variables
vercel env ls --project=teamboard
```

### Domain Verification

```bash
# Check domain status
vercel domains ls | grep teamboard.workermill.com

# Test SSL certificate
curl -I https://teamboard.workermill.com

# Check security headers
curl -I https://teamboard.workermill.com | grep -E "(X-Content-Type|X-Frame|X-XSS)"
```

### Build Verification

```bash
# Check recent builds
vercel deployments ls --project=teamboard --meta

# View build logs
vercel logs <deployment-url>

# Test application health
curl https://teamboard.workermill.com/api/health
```

## ⚠️ Troubleshooting

### Common Issues

#### Build Failures

**Issue:** Build fails with dependency errors
```bash
# Solution: Clear cache and redeploy
vercel --prod --force
```

**Issue:** TypeScript compilation errors
```bash
# Solution: Verify locally first
npm run typecheck
npm run build
```

#### Environment Variable Issues

**Issue:** Missing environment variables
```bash
# Check all required variables are set
vercel env ls --environment=production

# Add missing variables
vercel env add <variable-name> production
```

#### Domain/SSL Issues

**Issue:** SSL certificate not updating
```bash
# Force SSL certificate renewal
# Contact Vercel support if persists
```

#### Performance Issues

**Issue:** Slow function execution
- Check function timeout settings (should be 10s)
- Review function memory allocation
- Monitor function logs for errors

### Support Resources

- **Vercel Documentation:** https://vercel.com/docs
- **Next.js Deployment Guide:** https://nextjs.org/docs/deployment
- **Vercel Support:** support@vercel.com

## 📋 Pre-Production Checklist

Before final production deployment, verify:

- [ ] All environment variables configured correctly
- [ ] Domain DNS pointing to Vercel
- [ ] SSL certificate active and valid
- [ ] Build process completes successfully
- [ ] Security headers configured
- [ ] Performance targets met
- [ ] Monitoring and analytics enabled
- [ ] Auto-deployment from main branch working

---

**Last Updated:** {current_date}
**Vercel Project ID:** {VERCEL_PROJECT_ID}
**Organization:** {VERCEL_ORG_ID}