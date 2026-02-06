# Admin Management Scripts

This directory contains utility scripts for managing admin accounts. These scripts provide command-line tools for common administrative tasks.

## Available Scripts

### 1. Promote Admin to Super Admin

Promotes an existing admin account to super_admin role, granting them access to Admin Management features.

**Usage:**
```bash
cd server
npx tsx src/scripts/promote-super-admin.ts [email]
```

**Examples:**
```bash
# Promote the oldest admin account to super admin
npx tsx src/scripts/promote-super-admin.ts

# Promote a specific admin by email
npx tsx src/scripts/promote-super-admin.ts admin@example.com
```

**What it does:**
- If no email is provided, promotes the first (oldest) admin account
- If email is provided, promotes that specific admin
- Shows all admin accounts and their roles after promotion
- Skips promotion if the account is already a super admin

---

### 2. Reset Admin Password

Resets the password for any admin account without requiring email verification.

**Usage:**
```bash
cd server
npx tsx src/scripts/reset-admin-password.ts <email> <new-password>
```

**Examples:**
```bash
# Reset password for super admin
npx tsx src/scripts/reset-admin-password.ts superadmin@example.com NewSecurePass123

# Reset password for any admin
npx tsx src/scripts/reset-admin-password.ts admin@example.com MyNewPassword456
```

**Requirements:**
- Email must exist in the database
- Password must be at least 8 characters long
- Password will be automatically hashed before saving

---

## Common Use Cases

### Setting Up Initial Super Admin

When deploying for the first time or after implementing role-based access control:

```bash
cd server

# Option 1: Promote the first admin account
npx tsx src/scripts/promote-super-admin.ts

# Option 2: Promote a specific account you know the password for
npx tsx src/scripts/promote-super-admin.ts your-email@example.com
```

### Lost Password Recovery

If you've lost access to the super admin account:

```bash
cd server

# Reset the password directly
npx tsx src/scripts/reset-admin-password.ts superadmin@example.com YourNewPassword123

# Then login with the new password
```

### Changing Super Admin

If you want to transfer super admin privileges to another account:

```bash
cd server

# First, promote the new super admin
npx tsx src/scripts/promote-super-admin.ts new-admin@example.com

# The system supports multiple super admins, so you can have more than one
```

### Emergency Access

If all admins are locked out:

```bash
cd server

# Reset password for any admin account
npx tsx src/scripts/reset-admin-password.ts any-admin@example.com EmergencyPass123

# Then login and use the forgot password feature to set a permanent password
```

---

## Admin Roles

### Super Admin (`super_admin`)
- Full access to all features
- Can access Admin Management page
- Can create new admin accounts
- Can delete other admin accounts
- Can view all admin accounts and their roles

### Regular Admin (`admin`)
- Access to all features except Admin Management
- Can manage inventory (Cars, Tires, Wheel Drums)
- Can view and reply to customer inquiries
- Cannot create or delete admin accounts
- Cannot view other admin accounts

---

## Security Notes

⚠️ **Important Security Considerations:**

1. **Password Reset Script**: This script bypasses email verification and should only be used in emergencies or for initial setup. Store it securely and limit access.

2. **Multiple Super Admins**: You can have multiple super admins. Consider having at least 2-3 super admins to prevent lockouts.

3. **Password Requirements**: All passwords must be at least 8 characters long. Use strong passwords with a mix of uppercase, lowercase, numbers, and special characters.

4. **Script Access**: These scripts require direct server access and database credentials. Only authorized personnel should have access to run them.

5. **Audit Trail**: All login attempts (successful and failed) are logged in the LoginEvents collection for security auditing.

---

## Troubleshooting

### "MONGO_URI is not defined"
Make sure you're running the script from the server directory and that your `.env` file contains the `MONGO_URI` variable.

```bash
cd server
cat .env | grep MONGO_URI
```

### "No admin found with email"
Double-check the email address. Emails are stored in lowercase in the database.

### "Connection refused"
Ensure MongoDB is running and accessible. Check your `MONGO_URI` connection string.

### Script hangs or doesn't exit
Press `Ctrl+C` to force exit. The operation may have already completed.

---

## File Locations

- **Scripts Directory**: `/server/src/scripts/`
- **Admin Model**: `/server/src/models/Admin.ts`
- **Auth Middleware**: `/server/src/middleware/auth.ts`
- **Admin Routes**: `/server/src/routes/admin.routes.ts`

---

## Additional Resources

For more information about admin management features, see:
- Admin Management UI: `/admin-client/src/pages/AdminManagement.tsx`
- Authentication Context: `/admin-client/src/contexts/AuthContext.tsx`
- Login Events Model: `/server/src/models/LoginEvent.ts`
