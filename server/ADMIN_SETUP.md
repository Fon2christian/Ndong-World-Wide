# Admin Account Setup Guide

This guide explains how to create and manage admin accounts for the Ndong World Wide admin dashboard.

## Prerequisites

Before creating an admin account, ensure:
1. ✅ MongoDB is running and accessible
2. ✅ Environment variables are configured (`MONGO_URI`, `JWT_SECRET`)
3. ✅ Server dependencies are installed (`npm install`)

## Method 1: Using the Setup Script (Recommended)

The easiest way to create your first admin account is using the provided script:

```bash
cd server
npm run create-admin
```

The script will prompt you for:
- **Email**: Your admin email address
- **Name**: Your full name
- **Password**: Secure password (minimum 8 characters)

### Example Output

```text
🔌 Connecting to MongoDB...
✅ Connected to MongoDB

📝 Create First Admin Account

This script will create your first admin user.
You'll use these credentials to log in to the admin dashboard.

Email address: admin@example.com
Full name: Admin User
Password (min 8 characters): ********
Confirm password: ********

🔐 Creating admin account...

✅ Admin account created successfully!

═══════════════════════════════════════
📧 Email:     admin@example.com
👤 Name:      Admin User
🆔 Admin ID:  507f1f77bcf86cd799439011
═══════════════════════════════════════

🎉 You can now log in to the admin dashboard at:
   https://your-domain.com/admin
```

## Method 2: Using API Directly

### Register First Admin

```bash
curl -X POST https://your-domain.com/api/admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "securePassword123",
    "name": "Admin User"
  }'
```

### Login

```bash
curl -X POST https://your-domain.com/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "securePassword123"
  }'
```

**Response:**

```json
{
  "message": "Login successful",
  "token": "<JWT_TOKEN_HERE>",
  "admin": {
    "id": "507f1f77bcf86cd799439011",
    "email": "admin@example.com",
    "name": "Admin User"
  }
}
```

## Method 3: Using Admin Dashboard UI

1. Navigate to: `https://your-domain.com/admin`
2. Click on "Register" or "Create Account"
3. Fill in the registration form
4. Submit to create your admin account

## Password Requirements

- ✅ Minimum 8 characters
- ✅ Recommended: 16+ characters with mix of:
  - Uppercase letters (A-Z)
  - Lowercase letters (a-z)
  - Numbers (0-9)
  - Special characters (!@#$%^&*)

## Security Best Practices

### 1. Use Strong Passwords

```bash
# Good password examples:
MySecure@Pass2024!
Adm1n$Dashboard#2024
```

### 2. Secure Your JWT_SECRET

In `server/.env`:

```env
JWT_SECRET=your-very-long-random-secret-at-least-32-characters-long
```

Generate a strong secret:

```bash
# On Linux/Mac:
openssl rand -base64 32

# Or use Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3. HTTPS Only

**Never** create or use admin accounts over HTTP in production. Always use HTTPS.

### 4. Limit Admin Access

- Only create admin accounts for trusted users
- Don't share admin credentials
- Use different passwords for each admin
- Consider implementing 2FA (future enhancement)

## Managing Admin Accounts

### Check Current Admin Profile

```bash
curl -X GET https://your-domain.com/api/admin/me \
  -H "Authorization: Bearer <JWT_TOKEN_FROM_LOGIN>"
```

### Token Information

- **Expiration**: 7 days
- **Storage**: Automatically stored in browser (localStorage)
  - ⚠️ **Security Note**: localStorage is accessible to any page JavaScript and vulnerable to XSS attacks
  - For production deployments, consider using httpOnly, Secure cookies instead
  - Mitigate XSS risks with Content Security Policy (CSP) and proper input sanitization
  - Evaluate token storage strategy based on your threat model and session requirements
- **Usage**: Included in all authenticated requests

## Troubleshooting

### "Admin already exists"

If you see this error, an admin with that email already exists. Either:
- Use a different email address
- Log in with the existing credentials
- Contact the system administrator to reset

### "MONGO_URI not found"

Ensure your `.env` file has the MongoDB connection string:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database
```

### "JWT_SECRET not configured"

Add JWT_SECRET to your `.env` file:

```env
JWT_SECRET=your-secret-key-here
```

### Connection Timeout

Check that:
1. MongoDB is running
2. Network connectivity is working
3. MongoDB connection string is correct
4. IP whitelist includes your server (for MongoDB Atlas)

## Next Steps

After creating your admin account:

1. ✅ Log in to the admin dashboard
2. ✅ Verify all features work correctly
3. ✅ Create additional admin accounts if needed
4. ✅ Set up regular backups of the database
5. ✅ Configure monitoring and alerts

## Support

For issues or questions:
- Check the main README.md
- Review server logs
- Contact your system administrator
