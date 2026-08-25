const EMAIL_MAX_LENGTH = 254
const PASSWORD_MIN_LENGTH = 8
const PASSWORD_MAX_BYTES = 72

// Deliberately pragmatic: complete RFC 5322 validation belongs to the email
// provider. This catches malformed input without rejecting normal addresses.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export interface CredentialsInput {
  email: string
  password: string
}

export type CredentialsValidation =
  | { success: true; data: CredentialsInput }
  | { success: false; error: string }

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase()
}

export function validateEmail(
  value: unknown,
): { success: true; email: string } | { success: false; error: string } {
  if (typeof value !== "string") {
    return { success: false, error: "Enter a valid email address." }
  }

  const email = normalizeEmail(value)
  if (
    email.length === 0 ||
    email.length > EMAIL_MAX_LENGTH ||
    !EMAIL_PATTERN.test(email)
  ) {
    return { success: false, error: "Enter a valid email address." }
  }

  return { success: true, email }
}

export function validatePassword(
  value: unknown,
): { success: true; password: string } | { success: false; error: string } {
  if (typeof value !== "string") {
    return { success: false, error: "Password is required." }
  }

  if (value.length < PASSWORD_MIN_LENGTH) {
    return {
      success: false,
      error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`,
    }
  }

  if (new TextEncoder().encode(value).length > PASSWORD_MAX_BYTES) {
    return {
      success: false,
      error: `Password must be at most ${PASSWORD_MAX_BYTES} bytes.`,
    }
  }

  return { success: true, password: value }
}

export function validateCredentials(
  emailValue: unknown,
  passwordValue: unknown,
): CredentialsValidation {
  if (typeof emailValue !== "string" || typeof passwordValue !== "string") {
    return { success: false, error: "Email and password are required." }
  }

  const email = validateEmail(emailValue)
  if (!email.success) return email

  // bcrypt only uses the first 72 bytes. Reject longer values instead of
  // silently accepting two distinct passwords as equivalent.
  const password = validatePassword(passwordValue)
  if (!password.success) return password

  return {
    success: true,
    data: { email: email.email, password: password.password },
  }
}
