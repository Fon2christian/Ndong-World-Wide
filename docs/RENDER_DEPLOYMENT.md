# Render Deployment Guide

Deploy your application to Render with auto-deployment from GitHub in under 10 minutes.

## Why Render?

- ✅ **Auto-deploy from GitHub** - Push code, it deploys automatically
- ✅ **Free SSL certificates** - Automatic HTTPS
- ✅ **Zero DevOps** - No server management needed
- ✅ **Built-in monitoring** - Logs, metrics, alerts included
- ✅ **Easy scaling** - Click a button to scale up/down

## Prerequisites

1. **GitHub Repository** - Your code must be on GitHub (already done ✓)
2. **Render Account** - Sign up at [render.com](https://render.com) (free)
3. **MongoDB Atlas** - Free database at [mongodb.com/atlas](https://www.mongodb.com/atlas)

## Quick Deploy (5 minutes)

### Step 1: Setup MongoDB Atlas (2 minutes)

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas/database)
2. Sign up / Log in (free)
3. Create a **FREE** M0 cluster (512MB - perfect for starting)
4. Create Database User:
   - Username: `ndong-admin`
   - Password: Generate strong password (save it!)
5. Network Access → Add IP Address → **Allow Access from Anywhere** (0.0.0.0/0)
6. Get connection string:
   - Click **Connect** → **Connect your application**
   - Copy the connection string:
     ```
     mongodb+srv://ndong-admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your actual password
   - Add database name before the `?`:
     ```
     mongodb+srv://ndong-admin:yourpassword@cluster0.xxxxx.mongodb.net/ndong-db?retryWrites=true&w=majority
     ```

### Step 2: Deploy to Render (3 minutes)

1. **Go to Render Dashboard**: [dashboard.render.com](https://dashboard.render.com)

2. **Create Blueprint**:
   - Click **New** → **Blueprint**
   - Connect your GitHub account
   - Select your repository: `Ndong-World-Wide`
   - Branch: `develop` (or `main`)
   - Render detects `render.yaml` automatically ✓

3. **Configure Environment Variables**:

   Click on `ndong-api` service → Environment → Add:

   | Variable | Value |
   |----------|-------|
   | `MONGO_URI` | Your MongoDB connection string from Step 1 |
   | `EMAIL_HOST` | `smtp.gmail.com` |
   | `EMAIL_PORT` | `587` |
   | `EMAIL_SECURE` | `false` |
   | `EMAIL_USER` | Your Gmail address |
   | `EMAIL_PASS` | [Gmail App Password](#gmail-setup) |
   | `CONTACT_NOTIFICATION_EMAIL` | Email to receive contact forms |

4. **Click "Apply"** - Render will:
   - Create 2 services (ndong-api, ndong-nginx)
   - Build Docker images
   - Deploy your app
   - Provision SSL certificate

5. **Done!** Your app is live at: `https://ndong-nginx.onrender.com` 🎉

## Gmail Setup (for contact forms)

To get Gmail App Password:

1. Go to [Google Account](https://myaccount.google.com/)
2. Security → 2-Step Verification → Enable it
3. Security → App Passwords
4. Generate password for "Mail"
5. Copy the 16-character password
6. Use in `EMAIL_PASS` environment variable

## Your App URLs

After deployment:

- **Client (Public)**: `https://ndong-nginx.onrender.com/`
- **Admin Dashboard**: `https://ndong-nginx.onrender.com/admin`
- **API Health**: `https://ndong-nginx.onrender.com/api/health`

## Custom Domain (Optional)

1. Go to `ndong-nginx` service in Render
2. Settings → Custom Domains → Add Custom Domain
3. Enter your domain: `yourdomain.com`
4. Add DNS records (Render shows you exactly what to add):
   ```
   Type: CNAME
   Name: @ or www
   Value: ndong-nginx.onrender.com
   ```
5. Wait for DNS propagation (~5-60 minutes)
6. Render auto-provisions SSL certificate ✓

Your app will be at `https://yourdomain.com`!

## Auto-Deploy from GitHub

Every time you push to GitHub, Render automatically:

1. Detects the push
2. Pulls latest code
3. Builds new Docker images
4. Deploys with zero downtime
5. Sends you a notification

```bash
# Make changes to your code
git add .
git commit -m "Add new feature"
git push origin develop

# Render automatically deploys!
# Check status at dashboard.render.com
```

## Monitoring & Logs

### View Logs

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click on service (ndong-api or ndong-nginx)
3. **Logs** tab → See real-time logs

### Monitor Performance

Dashboard shows:
- CPU usage
- Memory usage
- Request count
- Response times
- Error rates

### Alerts

Set up alerts:
- Settings → Notifications
- Get notified on Slack/Email for:
  - Deploy failures
  - Service crashes
  - High error rates

## Cost

**Free Tier** (Good for testing):
- Services spin down after 15 min of inactivity
- Spin-up time: ~30 seconds

**Starter Plan** (Recommended for production):
- **$7/month per service** (2 services = $14/month)
- Always on
- 512MB RAM, 0.5 CPU
- Perfect for small-medium traffic

**MongoDB Atlas**:
- **FREE** (M0 tier, 512MB storage)

**Total**: $14/month for production (or free for testing)

Compare to VPS:
- VPS: ~$5-10/month + hours of setup + maintenance
- Render: $14/month + 5 min setup + zero maintenance

## Scaling

### Horizontal Scaling (More instances)

1. Service → Settings → Scaling
2. Increase instance count: 1 → 2, 3, 4...
3. Render auto-load balances
4. Cost: $7/month per instance

### Vertical Scaling (More resources)

1. Service → Settings
2. Upgrade plan:
   - Standard: 2GB RAM, 1 CPU - $25/month
   - Pro: 4GB RAM, 2 CPU - $85/month

## Troubleshooting

### Build Failed

**Check build logs**:
1. Go to service → Events
2. Click failed deploy
3. View logs for error

Common issues:
- Missing Dockerfile → Ensure `Dockerfile.render` exists
- Wrong path → Check `dockerfilePath` in render.yaml
- NPM install failed → Check package.json

### API Can't Connect to MongoDB

**Check connection string**:
- Ensure password is correct (no special URL characters)
- Database name is included
- MongoDB Atlas IP whitelist allows 0.0.0.0/0

**Test locally**:
```bash
# Test connection string
mongosh "mongodb+srv://..."
```

### Static Files Not Loading

**Check nginx logs**:
1. Go to ndong-nginx service → Logs
2. Look for 404 errors
3. Verify build succeeded

**Rebuild**:
1. Service → Manual Deploy → Deploy Latest Commit

### Service Won't Start

**Check environment variables**:
- Ensure all required vars are set
- No typos in variable names
- Values are correct format

**Check service logs**:
- Look for error messages on startup
- Common: MongoDB connection timeout

## Advanced

### Environment-Specific Deploys

**Staging**:
1. Create `staging` branch
2. Deploy separate blueprint from staging branch
3. Use different MongoDB database

**Production**:
- Deploy from `main` branch
- Use production MongoDB cluster

### Database Backups

**MongoDB Atlas automatic backups**:
1. Clusters → Your Cluster
2. Backup → Configure
3. Free tier: No backups
4. Upgrade to M2+ for automatic backups

**Manual backup**:
```bash
# Backup
mongodump --uri="your-connection-string"

# Restore
mongorestore --uri="your-connection-string" dump/
```

### Secrets Management

**Never commit secrets!**

✅ Good:
- Set in Render Environment Variables
- Use `.env.example` with placeholders
- Document required env vars

❌ Bad:
- Hardcode in code
- Commit to GitHub
- Share in Slack/email

### CI/CD Integration

Render auto-deploys from GitHub, but you can add tests:

**.github/workflows/test.yml**:
```yaml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm test
```

Render deploys only if tests pass.

## Support

- **Render Docs**: [render.com/docs](https://render.com/docs)
- **Community**: [community.render.com](https://community.render.com)
- **Status**: [status.render.com](https://status.render.com)
- **Contact**: help@render.com

## Next Steps

1. ✅ Sign up for Render: [render.com](https://render.com)
2. ✅ Setup MongoDB Atlas: [mongodb.com/atlas](https://www.mongodb.com/atlas)
3. ✅ Deploy via Blueprint (uses render.yaml)
4. ✅ Configure environment variables
5. ✅ Test your app: `https://ndong-nginx.onrender.com`
6. ✅ Add custom domain (optional)
7. ✅ Set up monitoring/alerts

**Questions?** Check the troubleshooting section above or ask in Render community!

Your app will be live in under 10 minutes! 🚀
