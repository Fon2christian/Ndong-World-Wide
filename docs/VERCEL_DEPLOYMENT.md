# Vercel Deployment Guide

This guide explains how to deploy the Ndong World Wide application to Vercel.

## Architecture

The application uses a monorepo structure with path-based routing:

```text
https://your-domain.vercel.app/          → Client (React SPA)
https://your-domain.vercel.app/admin    → Admin Dashboard (React SPA)
https://your-domain.vercel.app/api/*    → Server (Express API)
```

All three parts are deployed together in a single Vercel project with automatic HTTPS and CDN distribution.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **MongoDB Atlas**: Database instance (create at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas))
3. **GitHub Repository**: Code pushed to GitHub
4. **Node.js 20+**: For local development and testing

## Initial Setup

### 1. Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### 2. Prepare Environment Variables

Create a `.env.local` file with your production values:

```env
# MongoDB Connection
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ndong-worldwide

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=your-very-long-random-secret-at-least-32-characters-long

# Node Environment
NODE_ENV=production

# Server Port (Vercel will override this)
PORT=5002
```

**Security Note:** Never commit this file to git. It's already in `.gitignore`.

## Deployment Methods

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. **Import Project**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Project"
   - Select your GitHub repository
   - Vercel will auto-detect the `vercel.json` configuration

2. **Configure Environment Variables**
   - In the project settings, go to "Environment Variables"
   - Add all variables from your `.env.local` file:
     ```
     MONGO_URI = mongodb+srv://...
     JWT_SECRET = your-secret-here
     NODE_ENV = production
     ```
   - Apply to: Production, Preview, and Development

3. **Configure Build Settings**
   - Framework Preset: Other
   - Build Command: (leave default, uses `vercel.json`)
   - Output Directory: (leave default, uses `vercel.json`)
   - Install Command: `npm install`
   - Root Directory: `./` (monorepo root)

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (usually 2-5 minutes)
   - Your app will be live at `https://your-project.vercel.app`

### Method 2: Deploy via Vercel CLI

```bash
# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

The CLI will prompt you to configure the project on first deployment.

## Post-Deployment Setup

### 1. Create Admin Account

After deployment, create your first admin account:

#### Option A: Using local script (connects to production DB)

```bash
cd server
npm run create-admin
```

#### Option B: Using API directly

```bash
curl -X POST https://your-project.vercel.app/api/admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Secure@Password123!",
    "name": "Admin User"
  }'
```

### 2. Configure Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain (e.g., `ndongworldwide.com`)
3. Follow Vercel's DNS configuration instructions
4. SSL certificates are automatically provisioned

### 3. Test Your Deployment

#### Test Client

```bash
curl https://your-project.vercel.app/
```

#### Test Admin

```bash
curl https://your-project.vercel.app/admin
```

#### Test API

```bash
curl https://your-project.vercel.app/api/health
```

#### Test Admin Login

```bash
curl -X POST https://your-project.vercel.app/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Secure@Password123!"
  }'
```

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET` | Secret for JWT token signing | `openssl rand -base64 32` |
| `NODE_ENV` | Environment mode | `production` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port (Vercel overrides) | `5002` |

## Vercel Configuration

The `vercel.json` file at the project root configures:

- **Builds**: Separate builds for server, client, and admin
- **Routes**: Path-based routing for `/`, `/admin`, and `/api`
- **Headers**: Security headers (CSP, HSTS, X-Frame-Options, etc.)
- **Caching**: Optimal cache policies for static assets

## Features

### Automatic Features

- ✅ **HTTPS**: Automatic SSL certificates
- ✅ **CDN**: Global edge network
- ✅ **Compression**: Automatic gzip/brotli
- ✅ **HTTP/2**: Enabled by default
- ✅ **Previews**: Automatic preview deployments for PRs
- ✅ **Rollbacks**: One-click rollback to previous deployments

### Security Headers

Automatically applied via `vercel.json`:

```
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
Referrer-Policy: strict-origin-when-cross-origin
```

### Caching Strategy

- **HTML files**: `no-cache` (always fresh)
- **Static assets** (JS, CSS, images): `immutable, max-age=31536000` (1 year)

## Continuous Deployment

Vercel automatically deploys when you push to GitHub:

- **Production Branch** (main): Deploys to production URL
- **Preview Branches**: Each branch gets a unique preview URL
- **Pull Requests**: Automatic preview deployments with comments

## Monitoring and Logs

### View Logs

1. Go to your project in Vercel Dashboard
2. Click on a deployment
3. Navigate to "Logs" or "Functions" tab

### Real-time Logs (CLI)

```bash
vercel logs your-project.vercel.app
```

### Analytics

Vercel provides built-in analytics:
- Page views
- Performance metrics
- Error tracking

Enable in Project Settings → Analytics

## Troubleshooting

### Build Failures

**Error: "Module not found"**

Solution: Ensure all dependencies are in `package.json`:

```bash
npm install
```

**Error: "Build exceeded maximum duration"**

Solution: Optimize build by removing unused dependencies or upgrading Vercel plan.

### Runtime Errors

**Error: "MONGO_URI not found"**

Solution: Add environment variable in Vercel Dashboard → Settings → Environment Variables

**Error: "JWT_SECRET not configured"**

Solution: Add `JWT_SECRET` to environment variables

### API Routes Not Working

**Error: 404 on /api/***

Solution: Check `vercel.json` routes configuration. Ensure server build completed successfully.

### CORS Issues

If you encounter CORS errors:

1. Check that API routes use `/api` prefix
2. Verify CORS middleware in `server/src/server.ts`
3. Ensure environment variables are set correctly

## Performance Optimization

### 1. Enable Caching

Static assets are automatically cached. For API responses:

```typescript
// In your API routes
res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
```

### 2. Image Optimization

Use Vercel's Image Optimization:

```tsx
import Image from 'next/image'; // If using Next.js features
```

### 3. Edge Functions

For better performance, consider moving API routes to Edge Functions (Vercel's edge runtime).

## Scaling

Vercel automatically scales based on traffic:

- **Hobby Plan**: Suitable for small projects
- **Pro Plan**: For production apps with higher traffic
- **Enterprise**: Custom scaling and support

## Cost Estimation

### Hobby Plan (Free)

- Unlimited deployments
- 100 GB bandwidth/month
- Serverless function: 100 GB-hours

### Pro Plan ($20/month per user)

- 1 TB bandwidth/month
- Serverless function: 1000 GB-hours
- Advanced analytics

## Backup and Recovery

### Database Backups

MongoDB Atlas provides automatic backups. Configure in Atlas Dashboard:

1. Go to Clusters → Backup
2. Enable continuous backups
3. Configure snapshot schedule

### Deployment Rollback

To rollback to a previous deployment:

1. Go to Deployments in Vercel Dashboard
2. Find the working deployment
3. Click "⋯" → "Promote to Production"

## CI/CD Integration

Vercel integrates with GitHub Actions for additional CI/CD:

Example `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## Support

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **MongoDB Atlas Docs**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- **Project Issues**: Check the main README.md

## Next Steps

After successful deployment:

1. ✅ Test all features (client, admin, API)
2. ✅ Create admin account
3. ✅ Configure custom domain
4. ✅ Set up monitoring and alerts
5. ✅ Enable Vercel Analytics
6. ✅ Configure MongoDB backups
7. ✅ Test admin dashboard functionality
8. ✅ Review security headers and HTTPS

Your application is now live and globally distributed!
