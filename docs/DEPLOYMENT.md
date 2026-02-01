# Production Deployment Guide

## Prerequisites

- Docker and Docker Compose installed
- Domain name pointed to server IP
- Ports 80 and 443 open on firewall

## Initial Setup

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd Ndong-World-Wide
   ```

2. Copy environment files:

   ```bash
   cp server/.env.example server/.env
   cp client/.env.example client/.env.production
   cp admin-client/.env.example admin-client/.env.production
   ```

3. Update `server/.env` with production values:
   - Set `MONGO_URI` to your MongoDB connection string
   - Set `JWT_SECRET` to a secure random string
   - Configure email settings (SMTP credentials)
   - Set `PORT=5002` (default)
   - Set `NODE_ENV=production`

4. Update domain in `nginx/conf.d/default.conf`:
   - Replace `example.com` with your domain
   - Update `server_name _` to `server_name yourdomain.com www.yourdomain.com`

5. Update domain in `scripts/init-letsencrypt.sh`:
   - Set `domains=(yourdomain.com www.yourdomain.com)`
   - Set your email address in the `email` variable

6. Create build directories:

   ```bash
   mkdir -p client/dist admin-client/dist
   ```

   This ensures proper directory ownership before Docker builds.

## SSL Certificate Setup

1. Make scripts executable:

   ```bash
   chmod +x scripts/init-letsencrypt.sh
   chmod +x scripts/renew-ssl.sh
   ```

2. Initialize SSL certificates:

   ```bash
   ./scripts/init-letsencrypt.sh
   ```

   This script will:
   - Download recommended TLS parameters
   - Create a dummy certificate for nginx
   - Start nginx temporarily
   - Request real Let's Encrypt certificates
   - Reload nginx with real certificates

## Build and Deploy

1. Build all services:

   ```bash
   docker-compose build
   ```

2. Start services:

   ```bash
   docker-compose up -d
   ```

3. Check that all containers are running:

   ```bash
   docker-compose ps
   ```

4. Check logs for any errors:
   ```bash
   docker-compose logs -f
   ```

## SSL Renewal

Certificates automatically renew via the certbot container (runs every 12 hours).

Manual renewal:

```bash
./scripts/renew-ssl.sh
```

## Maintenance Commands

### View logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f nginx
docker-compose logs -f server
```

### Restart services

```bash
# All services
docker-compose restart

# Specific service
docker-compose restart nginx
```

### Stop services

```bash
docker-compose down
```

### Rebuild after code changes

```bash
docker-compose up -d --build
```

### Remove all containers and volumes

```bash
docker-compose down -v
```

## Verification

After deployment, verify everything is working:

1. **Check HTTP → HTTPS redirect**:
   ```bash
   curl -I http://yourdomain.com
   # Should return 301 redirect to https://
   ```

2. **Test client access**:
   ```bash
   curl -I https://yourdomain.com
   # Should return 200 OK
   ```

3. **Test admin access**:
   ```bash
   curl -I https://yourdomain.com/admin
   # Should return 200 OK
   ```

4. **Test health endpoint**:
   ```bash
   curl https://yourdomain.com/health
   # Should return "healthy"
   ```

5. **Check security headers**:
   ```bash
   curl -I https://yourdomain.com
   # Look for: Strict-Transport-Security, X-Frame-Options, etc.
   ```

6. **Test SSL certificate**:
   ```bash
   openssl s_client -connect yourdomain.com:443 -servername yourdomain.com
   # Should show valid Let's Encrypt certificate
   ```

## Architecture

### Routing Structure

```text
https://yourdomain.com/          → Client (React SPA)
https://yourdomain.com/admin     → Admin Dashboard (React SPA)
https://yourdomain.com/api/*     → Server (Express API)
```

### Container Architecture

```text
┌─────────────────────────────────────────┐
│           Nginx Container               │
│   - Port 80 (HTTP → HTTPS redirect)    │
│   - Port 443 (HTTPS)                   │
│   - SSL termination (Let's Encrypt)    │
│   - Security headers                   │
│   - Gzip compression                   │
└─────────────────┬───────────────────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
    ▼             ▼             ▼
┌─────────┐  ┌─────────┐  ┌─────────┐
│ Client  │  │  Admin  │  │ Server  │
│ (build) │  │ (build) │  │ :5002   │
└─────────┘  └─────────┘  └─────────┘
```

## Security Features

1. **SSL/TLS**: Let's Encrypt certificates with auto-renewal
2. **Security Headers**:
   - Strict-Transport-Security (HSTS)
   - X-Frame-Options (prevents clickjacking)
   - X-Content-Type-Options (prevents MIME sniffing)
   - Referrer-Policy
3. **Rate Limiting**: API endpoints rate-limited (10 req/s, burst 20)
4. **HTTP → HTTPS Redirect**: All HTTP traffic redirected to HTTPS
5. **Gzip Compression**: Reduced bandwidth usage
6. **Static Asset Caching**: Optimized performance

## Performance Optimizations

1. **Static file caching**: 1-year cache for immutable assets (JS, CSS, images)
2. **Gzip compression**: Text files compressed at level 6
3. **HTTP/2**: Enabled for better performance
4. **Keepalive connections**: Connection pooling to backend (32 connections)
5. **sendfile**: Zero-copy file serving via nginx

## Troubleshooting

### Nginx won't start

- Check nginx configuration syntax: `docker-compose exec nginx nginx -t`
- Check logs: `docker-compose logs nginx`
- Verify SSL certificates exist in `./certbot/conf/live/`

### SSL certificate errors

- Ensure domain DNS points to server IP
- Check ports 80 and 443 are open
- Verify email in `scripts/init-letsencrypt.sh`
- Check certbot logs: `docker-compose logs certbot`

### API not accessible

- Check server is running: `docker-compose ps server`
- Check server logs: `docker-compose logs server`
- Verify MongoDB connection in server/.env
- Test server health directly: `docker-compose exec -T server curl http://localhost:5002/api/health`
- Test nginx health: `curl http://localhost/health`

### Static files not loading

- Verify build directories exist: `ls -la client/dist admin-client/dist`
- Check nginx volume mounts in docker-compose.yml
- Rebuild client/admin: `docker-compose up -d --build client admin`

## Rollback Procedure

If deployment fails or issues occur:

1. Stop all services:
   ```bash
   docker-compose down
   ```

2. Checkout previous working version:
   ```bash
   git log --oneline  # Find previous commit
   git checkout <commit-hash>
   ```

3. Rebuild and restart:
   ```bash
   docker-compose up -d --build
   ```

## Monitoring

Monitor these metrics regularly:

- **Nginx logs**: `docker-compose logs nginx | tail -100`
- **Server logs**: `docker-compose logs server | tail -100`
- **Container health**: `docker-compose ps`
- **Disk usage**: `df -h`
- **SSL expiry**: Certificates renew automatically, check certbot logs if issues
- **Memory usage**: `docker stats`

## Backup

Ensure regular backups of:
1. **MongoDB database**: Use mongodump or cloud provider backups
2. **Environment files**: Secure backup of server/.env
3. **SSL certificates**: Backup ./certbot/conf/ directory
4. **User uploads**: If storing files locally, backup upload directories

## Updates

To update the application:

1. Pull latest code:
   ```bash
   git pull origin main
   ```

2. Rebuild and restart:
   ```bash
   docker-compose up -d --build
   ```

3. Monitor logs for errors:
   ```bash
   docker-compose logs -f
   ```

## Support

For issues or questions:
- Check logs first: `docker-compose logs`
- Review this documentation
- Check nginx configuration: `docker-compose exec nginx nginx -t`
- Verify all services are running: `docker-compose ps`
