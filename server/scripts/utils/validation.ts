/**
 * Shared validation utilities for admin CLI scripts
 */

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

export interface EmailValidationResult {
  valid: boolean;
  error?: string;
}

// Password validation regexes - hoisted to module scope
const UPPERCASE_REGEX = /[A-Z]/;
const LOWERCASE_REGEX = /[a-z]/;
const DIGIT_REGEX = /\d/;
// Expanded special character set to include more common characters
const SPECIAL_CHAR_REGEX = /[!@#$%^&*(),.?":{}|<>\-_\[\]\\/;'`~+=]/;

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates password complexity requirements
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }

  const hasUppercase = UPPERCASE_REGEX.test(password);
  const hasLowercase = LOWERCASE_REGEX.test(password);
  const hasDigit = DIGIT_REGEX.test(password);
  const hasSpecial = SPECIAL_CHAR_REGEX.test(password);

  if (!hasUppercase) {
    errors.push("At least one uppercase letter (A-Z)");
  }
  if (!hasLowercase) {
    errors.push("At least one lowercase letter (a-z)");
  }
  if (!hasDigit) {
    errors.push("At least one digit (0-9)");
  }
  if (!hasSpecial) {
    errors.push("At least one special character (!@#$%^&*-_[]etc.)");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates email format
 */
export function validateEmail(email: string): EmailValidationResult {
  // Trim whitespace from email input
  const trimmedEmail = email.trim();

  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return {
      valid: false,
      error: "Invalid email format",
    };
  }

  return { valid: true };
}

/**
 * Display validation errors
 * @param errors - Array of error messages to display
 * @param header - Optional header message (defaults to "Password must include:")
 */
export function displayValidationErrors(
  errors: string[],
  header: string = "Password must include:"
): void {
  console.error(`\n❌ Error: ${header}`);
  errors.forEach((error) => {
    console.error(`   - ${error}`);
  });
}
