import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../app.js';
import Admin from '../models/Admin.js';
import crypto from 'crypto';
import { vi } from 'vitest';

// Mock the email service
vi.mock('../services/emailService.js', () => ({
  sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
}));

describe('Admin Password Reset', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    // Set required environment variables
    process.env.JWT_SECRET = 'test-secret-key';

    // Disconnect if already connected
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await Admin.deleteMany({});
  });

  describe('POST /api/admin/forgot-password', () => {
    it('should return success message for valid email', async () => {
      await Admin.create({
        email: 'admin@test.com',
        password: 'password123',
        name: 'Test Admin',
      });

      const response = await request(app)
        .post('/api/admin/forgot-password')
        .send({ email: 'admin@test.com' })
        .expect(200);

      expect(response.body.message).toBe(
        'If an account exists with this email, a password reset link has been sent.'
      );

      // Verify token was created
      const admin = await Admin.findOne({ email: 'admin@test.com' })
        .select('+resetPasswordToken +resetPasswordExpires');
      expect(admin?.resetPasswordToken).toBeDefined();
      expect(admin?.resetPasswordExpires).toBeDefined();
    });

    it('should return same success message for non-existent email', async () => {
      const response = await request(app)
        .post('/api/admin/forgot-password')
        .send({ email: 'nonexistent@test.com' })
        .expect(200);

      expect(response.body.message).toBe(
        'If an account exists with this email, a password reset link has been sent.'
      );
    });

    it('should reject invalid email format', async () => {
      const response = await request(app)
        .post('/api/admin/forgot-password')
        .send({ email: 'invalid-email' })
        .expect(400);

      expect(response.body.message).toContain('valid email');
    });

    it('should enforce rate limiting', async () => {
      await Admin.create({
        email: 'admin@test.com',
        password: 'password123',
        name: 'Test Admin',
        lastPasswordResetRequest: new Date(Date.now() - 10 * 60 * 1000), // 10 min ago
      });

      const response = await request(app)
        .post('/api/admin/forgot-password')
        .send({ email: 'admin@test.com' })
        .expect(429);

      expect(response.body.message).toContain('Too many password reset requests');
    });

    it('should allow request after rate limit window passes', async () => {
      await Admin.create({
        email: 'admin@test.com',
        password: 'password123',
        name: 'Test Admin',
        lastPasswordResetRequest: new Date(Date.now() - 21 * 60 * 1000), // 21 min ago
      });

      await request(app)
        .post('/api/admin/forgot-password')
        .send({ email: 'admin@test.com' })
        .expect(200);
    });
  });

  describe('GET /api/admin/reset-password/:token', () => {
    it('should validate a valid token', async () => {
      const token = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      await Admin.create({
        email: 'admin@test.com',
        password: 'password123',
        name: 'Test Admin',
        resetPasswordToken: hashedToken,
        resetPasswordExpires: new Date(Date.now() + 3600000), // 1 hour
        resetPasswordAttempts: 0,
      });

      const response = await request(app)
        .get(`/api/admin/reset-password/${token}`)
        .expect(200);

      expect(response.body.valid).toBe(true);
      expect(response.body.email).toBe('admin@test.com');
    });

    it('should reject expired token', async () => {
      const token = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      await Admin.create({
        email: 'admin@test.com',
        password: 'password123',
        name: 'Test Admin',
        resetPasswordToken: hashedToken,
        resetPasswordExpires: new Date(Date.now() - 1000), // Expired
        resetPasswordAttempts: 0,
      });

      const response = await request(app)
        .get(`/api/admin/reset-password/${token}`)
        .expect(400);

      expect(response.body.valid).toBe(false);
      expect(response.body.message).toContain('Invalid or expired');
    });

    it('should reject invalid token', async () => {
      const response = await request(app)
        .get('/api/admin/reset-password/invalidtoken123')
        .expect(400);

      expect(response.body.valid).toBe(false);
    });

    it('should reject token after max attempts exceeded', async () => {
      const token = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      await Admin.create({
        email: 'admin@test.com',
        password: 'password123',
        name: 'Test Admin',
        resetPasswordToken: hashedToken,
        resetPasswordExpires: new Date(Date.now() + 3600000),
        resetPasswordAttempts: 5, // Max attempts reached
      });

      const response = await request(app)
        .get(`/api/admin/reset-password/${token}`)
        .expect(400);

      expect(response.body.valid).toBe(false);
      expect(response.body.message).toContain('attempts exceeded');
    });

    it('should increment attempt counter on validation', async () => {
      const token = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      await Admin.create({
        email: 'admin@test.com',
        password: 'password123',
        name: 'Test Admin',
        resetPasswordToken: hashedToken,
        resetPasswordExpires: new Date(Date.now() + 3600000),
        resetPasswordAttempts: 2,
      });

      await request(app).get(`/api/admin/reset-password/${token}`).expect(200);

      const admin = await Admin.findOne({ email: 'admin@test.com' })
        .select('+resetPasswordAttempts');
      expect(admin?.resetPasswordAttempts).toBe(3);
    });
  });

  describe('POST /api/admin/reset-password', () => {
    it('should reset password with valid token', async () => {
      const token = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      await Admin.create({
        email: 'admin@test.com',
        password: 'oldpassword123',
        name: 'Test Admin',
        resetPasswordToken: hashedToken,
        resetPasswordExpires: new Date(Date.now() + 3600000),
        resetPasswordAttempts: 0,
      });

      const response = await request(app)
        .post('/api/admin/reset-password')
        .send({
          token,
          newPassword: 'newpassword123',
        })
        .expect(200);

      expect(response.body.message).toContain('successfully reset');

      // Verify token was cleared
      const admin = await Admin.findOne({ email: 'admin@test.com' })
        .select('+resetPasswordToken +resetPasswordExpires');
      expect(admin?.resetPasswordToken).toBeUndefined();
      expect(admin?.resetPasswordExpires).toBeUndefined();

      // Verify new password works
      const loginResponse = await request(app)
        .post('/api/admin/login')
        .send({
          email: 'admin@test.com',
          password: 'newpassword123',
        })
        .expect(200);

      expect(loginResponse.body.token).toBeDefined();
    });

    it('should reject weak password', async () => {
      const token = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      await Admin.create({
        email: 'admin@test.com',
        password: 'password123',
        name: 'Test Admin',
        resetPasswordToken: hashedToken,
        resetPasswordExpires: new Date(Date.now() + 3600000),
        resetPasswordAttempts: 0,
      });

      const response = await request(app)
        .post('/api/admin/reset-password')
        .send({
          token,
          newPassword: 'weak',
        })
        .expect(400);

      expect(response.body.message).toContain('at least 8 characters');
    });

    it('should reject expired token', async () => {
      const token = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      await Admin.create({
        email: 'admin@test.com',
        password: 'password123',
        name: 'Test Admin',
        resetPasswordToken: hashedToken,
        resetPasswordExpires: new Date(Date.now() - 1000),
        resetPasswordAttempts: 0,
      });

      const response = await request(app)
        .post('/api/admin/reset-password')
        .send({
          token,
          newPassword: 'newpassword123',
        })
        .expect(400);

      expect(response.body.message).toContain('Invalid or expired');
    });

    it('should reject already used token', async () => {
      const token = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      await Admin.create({
        email: 'admin@test.com',
        password: 'password123',
        name: 'Test Admin',
        resetPasswordToken: hashedToken,
        resetPasswordExpires: new Date(Date.now() + 3600000),
        resetPasswordAttempts: 0,
      });

      // First reset - should succeed
      await request(app)
        .post('/api/admin/reset-password')
        .send({ token, newPassword: 'newpassword123' })
        .expect(200);

      // Second reset with same token - should fail
      const response = await request(app)
        .post('/api/admin/reset-password')
        .send({ token, newPassword: 'anotherpassword123' })
        .expect(400);

      expect(response.body.message).toContain('Invalid or expired');
    });
  });

  describe('Admin Model Methods', () => {
    it('should generate and store hashed token', async () => {
      const admin = await Admin.create({
        email: 'admin@test.com',
        password: 'password123',
        name: 'Test Admin',
      });

      const token = admin.createPasswordResetToken();

      expect(token).toHaveLength(64); // 32 bytes = 64 hex chars
      expect(admin.resetPasswordToken).toBeDefined();
      expect(admin.resetPasswordToken).not.toBe(token); // Should be hashed
      expect(admin.resetPasswordExpires).toBeDefined();

      // Verify expiration is ~1 hour in future
      const expirationTime = admin.resetPasswordExpires!.getTime() - Date.now();
      expect(expirationTime).toBeGreaterThan(3500000); // > 58 minutes
      expect(expirationTime).toBeLessThan(3700000); // < 62 minutes
    });

    it('should validate token correctly', async () => {
      const admin = await Admin.create({
        email: 'admin@test.com',
        password: 'password123',
        name: 'Test Admin',
      });

      const token = admin.createPasswordResetToken();
      await admin.save();

      const isValid = admin.validateResetToken(token);
      expect(isValid).toBe(true);
    });

    it('should reject invalid token', async () => {
      const admin = await Admin.create({
        email: 'admin@test.com',
        password: 'password123',
        name: 'Test Admin',
      });

      admin.createPasswordResetToken();
      await admin.save();

      const isValid = admin.validateResetToken('invalidtoken123');
      expect(isValid).toBe(false);
    });

    it('should clear reset token', async () => {
      const admin = await Admin.create({
        email: 'admin@test.com',
        password: 'password123',
        name: 'Test Admin',
      });

      admin.createPasswordResetToken();
      admin.clearResetToken();
      await admin.save();

      const updatedAdmin = await Admin.findById(admin._id)
        .select('+resetPasswordToken +resetPasswordExpires +resetPasswordAttempts');

      expect(updatedAdmin?.resetPasswordToken).toBeUndefined();
      expect(updatedAdmin?.resetPasswordExpires).toBeUndefined();
      expect(updatedAdmin?.resetPasswordAttempts).toBe(0);
    });
  });
});
