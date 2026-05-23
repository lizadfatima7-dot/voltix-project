/**
 * Email validation utilities to block disposable/fake email addresses.
 * Mirror of frontend/src/lib/email-validation.ts for test compatibility.
 */

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com", "guerrillamail.com", "guerrillamail.net", "guerrillamail.org",
  "temp-mail.org", "temp-mail.com", "temp-mail.de",
  "tempmail.com", "tempmail.de", "tempmail.eu", "tempmail.net", "tempmail.org",
  "yopmail.com", "yopmail.fr", "yopmail.net",
  "throwam.com", "sharklasers.com",
  "trashmail.com", "trashmail.me", "trashmail.net", "trashmail.at", "trashmail.org",
  "trash-mail.com", "trash-mail.de",
  "10minutemail.com", "10minutemail.net",
  "maildrop.cc", "mailnesia.com", "mailnull.com", "mailsac.com",
  "dispostable.com", "fakeinbox.com", "tempinbox.com",
  "getnada.com", "filzmail.com", "mohmal.com",
  "wegwerfmail.de", "wegwerfmail.net", "guerrillamailblock.com", "grr.la",
  "spam4.me", "spamgourmet.com", "mytrashmail.com", "throwaway.email",
  "throwaway-mail.com", "throwawayemailaddress.com",
  "getairmail.com", "dropmail.me", "deadaddress.com", "dontreg.com",
  "meltmail.com", "neverbox.com", "no-spam.ws",
  "one-time.email", "oneoffemail.com",
  "spambox.org", "spamfree.eu", "spamhole.com",
  "teleworm.com", "tmpmail.org", "tmpmail.net", "tmpmail.com",
  "selfdestructingmail.com", "rhyta.com",
]);

export interface EmailValidationResult {
  valid: boolean;
  error?: string;
}

export function isDisposableEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return true;
  return DISPOSABLE_DOMAINS.has(domain);
}

export async function validateEmailDomain(email: string): Promise<EmailValidationResult> {
  if (!email || !email.includes("@")) {
    return { valid: false, error: "Please use a real email address" };
  }
  const domain = email.toLowerCase().trim().split("@")[1];
  if (!domain) {
    return { valid: false, error: "Please use a real email address" };
  }
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { valid: false, error: "Please use a real email address" };
  }
  const suspiciousPatterns = [/temp/i, /trash/i, /spam/i, /fake/i, /disposable/i, /throwaway/i, /guerrilla/i, /mailinator/i, /yopmail/i];
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(domain)) {
      return { valid: false, error: "Please use a real email address" };
    }
  }
  return { valid: true };
}

export async function validateMxRecords(domain: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=MX`,
      { headers: { Accept: "application/dns-json" }, signal: AbortSignal.timeout(5000) }
    );
    if (!response.ok) return true;
    const data = await response.json();
    return data.Status === 0 && data.Answer && data.Answer.length > 0;
  } catch {
    return true;
  }
}
