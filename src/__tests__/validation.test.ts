import { describe, it, expect } from "vitest";
import { z } from "zod";

// Re-implement the validation logic from auth.tsx and index.tsx for testing
// These are pure functions that can be tested independently

// Email validation schema (from auth.tsx)
const emailSchema = z.string().trim().toLowerCase().email("Genuine və düzgün e-poçt ünvanı daxil edin").max(255);

// Strong password schema (from auth.tsx)
const strongPasswordSchema = z.string()
  .min(12, "Parol ən azı 12 simvol olmalıdır")
  .max(72, "Parol 72 simvoldan uzun ola bilməz")
  .regex(/[A-Z]/, "Parolda ən azı bir böyük hərf olmalıdır")
  .regex(/[a-z]/, "Parolda ən azı bir kiçik hərf olmalıdır")
  .regex(/[0-9]/, "Parolda ən azı bir rəqəm olmalıdır")
  .regex(/[^A-Za-z0-9]/, "Parolda ən azı bir xüsusi simvol olmalıdır");

// Blocked email domains (from auth.tsx)
const blockedEmailDomains = new Set([
  "mailinator.com",
  "10minutemail.com",
  "tempmail.com",
  "guerrillamail.com",
  "yopmail.com",
  "example.com",
  "test.com",
  "invalid.com",
]);

function validateRealEmail(email: string) {
  const [local = "", domain = ""] = email.toLowerCase().split("@");
  if (blockedEmailDomains.has(domain) || /\.(test|invalid|local)$/.test(domain)) {
    return "Müvəqqəti, test və ya aktiv olmayan e-poçt domenləri qəbul edilmir.";
  }
  if (/^(test|fake|demo|example|admin|user)\d*$/i.test(local) || local.length < 3) {
    return "Zəhmət olmasa real və aktiv şəxsi e-poçt ünvanı daxil edin.";
  }
  return null;
}

// Password score function (from auth.tsx)
function passwordScore(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (pw.length >= 12) s++;
  return Math.min(s, 4);
}

// Card validation (from index.tsx)
function isValidCardNumber(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19 || /^(\d)\1+$/.test(digits)) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = Number(digits[i]);
    if (shouldDouble) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

function isValidExpiry(value: string) {
  const match = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(value);
  if (!match) return false;
  const expiry = new Date(2000 + Number(match[2]), Number(match[1]), 0, 23, 59, 59);
  return expiry >= new Date();
}

describe("Email Validation", () => {
  describe("emailSchema (Zod)", () => {
    it("accepts valid email", () => {
      expect(emailSchema.safeParse("user@example.org").success).toBe(true);
    });

    it("rejects invalid email format", () => {
      expect(emailSchema.safeParse("not-an-email").success).toBe(false);
    });

    it("rejects email without domain", () => {
      expect(emailSchema.safeParse("user@").success).toBe(false);
    });

    it("rejects email without local part", () => {
      expect(emailSchema.safeParse("@domain.com").success).toBe(false);
    });

    it("trims whitespace", () => {
      const result = emailSchema.safeParse("  user@domain.com  ");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("user@domain.com");
      }
    });

    it("converts to lowercase", () => {
      const result = emailSchema.safeParse("USER@DOMAIN.COM");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("user@domain.com");
      }
    });

    it("rejects email longer than 255 chars", () => {
      const longEmail = "a".repeat(250) + "@b.com";
      expect(emailSchema.safeParse(longEmail).success).toBe(false);
    });
  });

  describe("validateRealEmail", () => {
    it("blocks mailinator.com", () => {
      expect(validateRealEmail("user@mailinator.com")).not.toBeNull();
    });

    it("blocks tempmail.com", () => {
      expect(validateRealEmail("user@tempmail.com")).not.toBeNull();
    });

    it("blocks yopmail.com", () => {
      expect(validateRealEmail("user@yopmail.com")).not.toBeNull();
    });

    it("blocks example.com", () => {
      expect(validateRealEmail("user@example.com")).not.toBeNull();
    });

    it("blocks .test TLD", () => {
      expect(validateRealEmail("user@domain.test")).not.toBeNull();
    });

    it("blocks .invalid TLD", () => {
      expect(validateRealEmail("user@domain.invalid")).not.toBeNull();
    });

    it("blocks .local TLD", () => {
      expect(validateRealEmail("user@domain.local")).not.toBeNull();
    });

    it("blocks test local part", () => {
      expect(validateRealEmail("test@gmail.com")).not.toBeNull();
    });

    it("blocks test123 local part", () => {
      expect(validateRealEmail("test123@gmail.com")).not.toBeNull();
    });

    it("blocks fake local part", () => {
      expect(validateRealEmail("fake@gmail.com")).not.toBeNull();
    });

    it("blocks demo local part", () => {
      expect(validateRealEmail("demo@gmail.com")).not.toBeNull();
    });

    it("blocks admin local part", () => {
      expect(validateRealEmail("admin@gmail.com")).not.toBeNull();
    });

    it("blocks user local part", () => {
      expect(validateRealEmail("user@gmail.com")).not.toBeNull();
    });

    it("blocks local part shorter than 3 chars", () => {
      expect(validateRealEmail("ab@gmail.com")).not.toBeNull();
    });

    it("accepts valid real email", () => {
      expect(validateRealEmail("fatima.aliyeva@gmail.com")).toBeNull();
    });

    it("accepts email with numbers in local part", () => {
      expect(validateRealEmail("john.doe123@company.com")).toBeNull();
    });
  });
});

describe("Password Validation", () => {
  describe("strongPasswordSchema", () => {
    it("rejects password shorter than 12 chars", () => {
      expect(strongPasswordSchema.safeParse("Abc123!@#").success).toBe(false);
    });

    it("rejects password longer than 72 chars", () => {
      const longPw = "Aa1!" + "x".repeat(70);
      expect(strongPasswordSchema.safeParse(longPw).success).toBe(false);
    });

    it("rejects password without uppercase", () => {
      expect(strongPasswordSchema.safeParse("abcdefgh123!@#").success).toBe(false);
    });

    it("rejects password without lowercase", () => {
      expect(strongPasswordSchema.safeParse("ABCDEFGH123!@#").success).toBe(false);
    });

    it("rejects password without number", () => {
      expect(strongPasswordSchema.safeParse("AbcdefghIJK!@#").success).toBe(false);
    });

    it("rejects password without special char", () => {
      expect(strongPasswordSchema.safeParse("Abcdefgh12345").success).toBe(false);
    });

    it("accepts valid strong password", () => {
      expect(strongPasswordSchema.safeParse("MySecure123!@#").success).toBe(true);
    });

    it("accepts password at minimum length", () => {
      expect(strongPasswordSchema.safeParse("Abcdefgh12!@").success).toBe(true);
    });

    it("accepts password at maximum length", () => {
      const maxPw = "Aa1!" + "x".repeat(68);
      expect(strongPasswordSchema.safeParse(maxPw).success).toBe(true);
    });
  });

  describe("passwordScore", () => {
    it("returns 0 for empty password", () => {
      expect(passwordScore("")).toBe(0);
    });

    it("returns 0 for short simple password", () => {
      expect(passwordScore("abc")).toBe(0);
    });

    it("returns 1 for 8+ char lowercase only", () => {
      expect(passwordScore("abcdefgh")).toBe(1);
    });

    it("returns 2 for 8+ chars with uppercase", () => {
      expect(passwordScore("Abcdefgh")).toBe(2);
    });

    it("returns 3 for 8+ chars with uppercase and number", () => {
      expect(passwordScore("Abcdefg1")).toBe(3);
    });

    it("returns 4 for 8+ chars with uppercase, number, and special", () => {
      expect(passwordScore("Abcdefg1!")).toBe(4);
    });

    it("returns 4 for 12+ chars with all criteria", () => {
      expect(passwordScore("Abcdefgh123!")).toBe(4);
    });

    it("caps at 4 even with extra length", () => {
      expect(passwordScore("Abcdefghijklmnop123!@#")).toBe(4);
    });
  });
});

describe("Credit Card Validation", () => {
  describe("isValidCardNumber (Luhn algorithm)", () => {
    it("validates known valid Visa card", () => {
      expect(isValidCardNumber("4111111111111111")).toBe(true);
    });

    it("validates known valid Mastercard", () => {
      expect(isValidCardNumber("5500000000000004")).toBe(true);
    });

    it("validates card with spaces", () => {
      expect(isValidCardNumber("4111 1111 1111 1111")).toBe(true);
    });

    it("validates card with dashes", () => {
      expect(isValidCardNumber("4111-1111-1111-1111")).toBe(true);
    });

    it("rejects card with invalid checksum", () => {
      expect(isValidCardNumber("4111111111111112")).toBe(false);
    });

    it("rejects card shorter than 13 digits", () => {
      expect(isValidCardNumber("411111111111")).toBe(false);
    });

    it("rejects card longer than 19 digits", () => {
      expect(isValidCardNumber("41111111111111111111")).toBe(false);
    });

    it("rejects all same digits (e.g., 1111111111111)", () => {
      expect(isValidCardNumber("1111111111111")).toBe(false);
    });

    it("rejects all zeros", () => {
      expect(isValidCardNumber("0000000000000000")).toBe(false);
    });

    it("rejects empty string", () => {
      expect(isValidCardNumber("")).toBe(false);
    });

    it("rejects non-numeric string", () => {
      expect(isValidCardNumber("abcdefghijklmnop")).toBe(false);
    });
  });

  describe("isValidExpiry", () => {
    it("accepts valid future date", () => {
      // Use a date far in the future
      expect(isValidExpiry("12/99")).toBe(true);
    });

    it("rejects invalid month 00", () => {
      expect(isValidExpiry("00/30")).toBe(false);
    });

    it("rejects invalid month 13", () => {
      expect(isValidExpiry("13/30")).toBe(false);
    });

    it("rejects wrong format MM-YY", () => {
      expect(isValidExpiry("12-30")).toBe(false);
    });

    it("rejects wrong format M/YY", () => {
      expect(isValidExpiry("1/30")).toBe(false);
    });

    it("rejects wrong format MM/YYYY", () => {
      expect(isValidExpiry("12/2030")).toBe(false);
    });

    it("rejects empty string", () => {
      expect(isValidExpiry("")).toBe(false);
    });

    it("rejects past date", () => {
      expect(isValidExpiry("01/20")).toBe(false);
    });

    it("accepts current month if not expired", () => {
      const now = new Date();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const year = String(now.getFullYear()).slice(-2);
      // Current month should be valid (expires at end of month)
      expect(isValidExpiry(`${month}/${year}`)).toBe(true);
    });
  });
});
