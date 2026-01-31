import { describe, it, expect, beforeEach } from "vitest";
import Admin, { type IAdmin } from "./Admin.js";

describe("Admin Model", () => {
  beforeEach(async () => {
    // Clear admins before each test
    await Admin.deleteMany({});
  });

  describe("Admin Creation", () => {
    it("should create a new admin with valid data", async () => {
      const adminData = {
        email: "admin@test.com",
        password: "SecurePassword123",
        name: "Test Admin",
      };

      const admin = await Admin.create(adminData);

      expect(admin).toBeDefined();
      expect(admin.email).toBe(adminData.email);
      expect(admin.name).toBe(adminData.name);
      expect(admin.password).not.toBe(adminData.password); // Password should be hashed
      expect(admin.createdAt).toBeInstanceOf(Date);
      expect(admin.updatedAt).toBeInstanceOf(Date);
    });

    it("should hash password before saving", async () => {
      const plainPassword = "SecurePassword123";
      const admin = await Admin.create({
        email: "admin@test.com",
        password: plainPassword,
        name: "Test Admin",
      });

      // Password should be hashed
      expect(admin.password).not.toBe(plainPassword);
      expect(admin.password).toMatch(/^\$2[aby]\$\d{1,2}\$/); // bcrypt hash format
    });

    it("should convert email to lowercase", async () => {
      const admin = await Admin.create({
        email: "ADMIN@TEST.COM",
        password: "SecurePassword123",
        name: "Test Admin",
      });

      expect(admin.email).toBe("admin@test.com");
    });

    it("should trim email and name", async () => {
      const admin = await Admin.create({
        email: "  admin@test.com  ",
        password: "SecurePassword123",
        name: "  Test Admin  ",
      });

      expect(admin.email).toBe("admin@test.com");
      expect(admin.name).toBe("Test Admin");
    });

    it("should reject duplicate email addresses", async () => {
      const adminData = {
        email: "admin@test.com",
        password: "SecurePassword123",
        name: "Test Admin",
      };

      await Admin.create(adminData);

      // Attempt to create another admin with the same email
      await expect(Admin.create(adminData)).rejects.toThrow();
    });

    it("should require email field", async () => {
      await expect(
        Admin.create({
          password: "SecurePassword123",
          name: "Test Admin",
        } as any)
      ).rejects.toThrow();
    });

    it("should require password field", async () => {
      await expect(
        Admin.create({
          email: "admin@test.com",
          name: "Test Admin",
        } as any)
      ).rejects.toThrow();
    });

    it("should require name field", async () => {
      await expect(
        Admin.create({
          email: "admin@test.com",
          password: "SecurePassword123",
        } as any)
      ).rejects.toThrow();
    });
  });

  describe("Password Comparison", () => {
    let admin: IAdmin;
    const plainPassword = "SecurePassword123";

    beforeEach(async () => {
      admin = await Admin.create({
        email: "admin@test.com",
        password: plainPassword,
        name: "Test Admin",
      });
    });

    it("should return true for correct password", async () => {
      const isMatch = await admin.comparePassword(plainPassword);
      expect(isMatch).toBe(true);
    });

    it("should return false for incorrect password", async () => {
      const isMatch = await admin.comparePassword("WrongPassword");
      expect(isMatch).toBe(false);
    });

    it("should return false for empty password", async () => {
      const isMatch = await admin.comparePassword("");
      expect(isMatch).toBe(false);
    });

    it("should handle case-sensitive passwords", async () => {
      const isMatch = await admin.comparePassword("securepassword123");
      expect(isMatch).toBe(false);
    });
  });

  describe("Password Hashing on Update", () => {
    it("should rehash password when modified", async () => {
      const admin = await Admin.create({
        email: "admin@test.com",
        password: "OldPassword123",
        name: "Test Admin",
      });

      const oldHash = admin.password;

      // Update password
      admin.password = "NewPassword123";
      await admin.save();

      // Password hash should be different
      expect(admin.password).not.toBe(oldHash);
      expect(admin.password).not.toBe("NewPassword123");

      // New password should work
      const isMatch = await admin.comparePassword("NewPassword123");
      expect(isMatch).toBe(true);

      // Old password should not work
      const oldMatch = await admin.comparePassword("OldPassword123");
      expect(oldMatch).toBe(false);
    });

    it("should not rehash password when other fields are updated", async () => {
      const admin = await Admin.create({
        email: "admin@test.com",
        password: "SecurePassword123",
        name: "Test Admin",
      });

      const originalHash = admin.password;

      // Update name only
      admin.name = "Updated Admin";
      await admin.save();

      // Password hash should remain the same
      expect(admin.password).toBe(originalHash);

      // Password should still work
      const isMatch = await admin.comparePassword("SecurePassword123");
      expect(isMatch).toBe(true);
    });
  });
});
