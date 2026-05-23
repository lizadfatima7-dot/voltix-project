/**
 * Email validation utilities to block disposable/fake email addresses
 * and verify legitimate email providers.
 */

// Blocklist of common disposable/temporary email domains
const DISPOSABLE_DOMAINS = new Set([
  "temp-mail.org", "temp-mail.com", "temp-mail.de",
  "tempmail.com", "tempmail.de", "tempmail.eu", "tempmail.net", "tempmail.org",
  "10minutemail.com", "10minutemail.net",
  "guerrillamail.com", "guerrillamail.net", "guerrillamail.org", "guerrillamail.de",
  "guerrillamailblock.com", "grr.la",
  "mailinator.com", "mailinator.net", "mailinator2.com",
  "yopmail.com", "yopmail.fr", "yopmail.net",
  "throwam.com", "throam.com",
  "sharklasers.com", "guerrillamail.info",
  "getairmail.com", "maildrop.cc", "dropmail.me",
  "trashmail.com", "trashmail.net", "trashmail.me", "trashmail.org",
  "trash-mail.com", "trash-mail.de",
  "spam4.me", "spamgourmet.com", "spamgourmet.net",
  "deadaddress.com", "dontreg.com",
  "fakeinbox.com", "filzmail.com", "getnada.com",
  "mailnesia.com", "mailnull.com", "mailsac.com",
  "meltmail.com", "mohmal.com", "mt2014.com",
  "mytrashmail.com", "neverbox.com",
  "no-spam.ws", "nospam4.us", "nospamfor.us",
  "throwaway.email", "throwaway-mail.com", "throwawayemailaddress.com",
  "tempail.com", "tempalias.com", "tempemail.net",
  "tmpmail.org", "tmpmail.net", "tmpmail.com",
  "one-time.email", "oneoffemail.com",
  "mailforspam.com", "mailexpire.com",
  "dispostable.com", "disposableemailaddresses.emailmiser.com",
  "emailondeck.com", "emailsensei.com",
  "guerrillamailblock.com", "harakirimail.com",
  "hidemail.de", "incognitomail.org",
  "jetable.org", "kasmail.com",
  "mailcatch.com", "maileater.com",
  "mailhazard.com", "mailimate.com",
  "mailmoat.com", "mailnator.com",
  "mailshell.com", "mailsiphon.com",
  "mailtemp.info", "mailtrash.net",
  "mintemail.com", "mmmmail.com",
  "mytempemail.com", "nepwk.com",
  "nobulk.com", "noclickemail.com",
  "nogmailspam.info", "nomail2me.com",
  "notmailinator.com", "nowmymail.com",
  "otherinbox.com", "owlpic.com",
  "proxymail.eu", "rcpt.at",
  "reallymymail.com", "recode.me",
  "regbypass.com", "rhyta.com",
  "safersignup.de", "safetymail.info",
  "sandelf.de", "selfdestructingmail.com",
  "sendingspamfree.com", "shitmail.de", "shitmail.org",
  "skeefmail.com", "slippery.email", "slushmail.com",
  "smashmail.de", "snkmail.com",
  "sofimail.com", "spam.la", "spam.org.es",
  "spambox.org", "spamcannon.com",
  "spamdecoy.com", "spamex.com",
  "spamfree.eu", "spamhole.com",
  "spamify.com", "spammotel.com",
  "spamslicer.com", "spamstack.com",
  "superrito.com", "teleworm.com",
  "tilien.com", "tmailinator.com",
  "toiea.com", "tradermail.info",
  "trbvm.com", "trbvn.com",
  "uggsrock.com", "veryrealemail.com",
  "viditag.com", "viewcastmedia.com",
  "webm4il.info", "wegwerfmail.de", "wegwerfmail.net",
  "wetrainbayarea.com", "wh4f.org",
  "whyspam.me", "willhackforfood.biz",
  "wuzupmail.net", "xagloo.com",
  "yep.it", "yogamaven.com",
  "yuurok.com", "zehnminutenmail.de",
  "zippymail.info", "zoaxe.com",
  "zoemail.org", "inboxkitten.com",
  "emailfake.com", "crazymailing.com",
  "maildrop.cc", "discard.email",
  "discardmail.com", "discardmail.de",
  "emailisvalid.com", "emailwarden.com",
  "fakedemail.com", "fakemailgenerator.com",
  "generator.email", "guerrillamail.biz",
  "jourrapide.com", "kasmail.com",
  "mail-temporaire.fr", "mailGater.com",
  "mailhub.pw", "mailnesia.com",
  "spamcero.com", "tempinbox.com",
  "throwam.com", "trash2009.com",
  "yolanda.com", "cool.fr.nf",
  "jetable.fr.nf", "courriel.fr.nf",
  "moncourrier.fr.nf", "speed.1s.fr",
  "haltospam.com", "ieatspam.eu",
  "killmail.com", "killmail.net",
  "letthemeatspam.com", "mailfreeonline.com",
  "instant-mail.de", "sofort-mail.de",
  "einrot.com", "e4ward.com",
]);

// Allowlist of known legitimate email providers
const ALLOWED_DOMAINS = new Set([
  // Google
  "gmail.com", "googlemail.com",
  // Microsoft
  "outlook.com", "hotmail.com", "live.com", "msn.com",
  "hotmail.co.uk", "hotmail.fr", "hotmail.de", "hotmail.it",
  "outlook.co.uk", "outlook.fr", "outlook.de",
  // Yahoo
  "yahoo.com", "yahoo.co.uk", "yahoo.fr", "yahoo.de",
  "yahoo.it", "yahoo.ca", "yahoo.com.au", "yahoo.co.jp",
  "ymail.com", "rocketmail.com",
  // Apple
  "icloud.com", "me.com", "mac.com",
  // ProtonMail
  "protonmail.com", "protonmail.ch", "proton.me", "pm.me",
  // Other legitimate providers
  "aol.com", "zoho.com", "zohomail.com",
  "mail.com", "email.com",
  "gmx.com", "gmx.net", "gmx.de",
  "web.de", "t-online.de", "freenet.de",
  "yandex.com", "yandex.ru",
  "mail.ru", "inbox.ru", "list.ru", "bk.ru",
  "tutanota.com", "tutamail.com", "tuta.io",
  "fastmail.com", "fastmail.fm",
  "hey.com", "runbox.com",
  "cox.net", "sbcglobal.net", "att.net", "bellsouth.net",
  "verizon.net", "comcast.net", "charter.net", "earthlink.net",
  // Regional/ISP
  "btinternet.com", "virginmedia.com", "sky.com",
  "orange.fr", "wanadoo.fr", "laposte.net", "sfr.fr", "free.fr",
  "libero.it", "virgilio.it", "alice.it", "tin.it",
  "telenet.be", "skynet.be",
  "bluewin.ch",
  "shaw.ca", "rogers.com", "sympatico.ca",
  "bigpond.com", "optusnet.com.au",
  // Education (common patterns)
  "edu", "ac.uk", "edu.au",
]);

/**
 * Check if a domain matches the disposable blocklist
 */
function isDomainDisposable(domain: string): boolean {
  return DISPOSABLE_DOMAINS.has(domain.toLowerCase());
}

/**
 * Check if a domain matches a known legitimate provider
 * or has a legitimate TLD pattern (e.g., .edu, .gov, corporate domains)
 */
function isDomainAllowed(domain: string): boolean {
  const lower = domain.toLowerCase();

  // Direct match in allowlist
  if (ALLOWED_DOMAINS.has(lower)) return true;

  // Allow educational and government domains
  if (lower.endsWith(".edu") || lower.endsWith(".gov") || lower.endsWith(".ac.uk") || lower.endsWith(".edu.au")) {
    return true;
  }

  // Allow corporate/business domains that aren't in the blocklist
  // (companies using their own domain for email)
  // If not in disposable list, allow it (corporate domains are legitimate)
  if (!isDomainDisposable(lower)) {
    return true;
  }

  return false;
}

/**
 * Validate email domain MX records using DNS-over-HTTPS (Cloudflare)
 * Returns true if valid MX records exist, false otherwise.
 * Falls back to true on network errors to avoid blocking legitimate users.
 */
export async function validateMxRecords(domain: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=MX`,
      {
        headers: { Accept: "application/dns-json" },
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!response.ok) return true; // fail-open on network issues

    const data = await response.json();
    // Status 0 = NOERROR, check if there are MX answers
    if (data.Status === 0 && data.Answer && data.Answer.length > 0) {
      return true;
    }

    // No MX records found - likely not a real email domain
    return false;
  } catch {
    // Network error or timeout - fail open to avoid blocking users
    return true;
  }
}

export interface EmailValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Full email domain validation:
 * 1. Check against disposable domain blocklist
 * 2. Verify domain is allowed (known provider or corporate)
 * 3. Verify MX records exist
 */
export async function validateEmailDomain(email: string): Promise<EmailValidationResult> {
  const domain = email.split("@")[1]?.toLowerCase();

  if (!domain) {
    return { valid: false, error: "Please use a real email address" };
  }

  // Check disposable blocklist
  if (isDomainDisposable(domain)) {
    return { valid: false, error: "Please use a real email address" };
  }

  // Check if domain is allowed
  if (!isDomainAllowed(domain)) {
    return { valid: false, error: "Please use a real email address" };
  }

  // Verify MX records
  const hasMx = await validateMxRecords(domain);
  if (!hasMx) {
    return { valid: false, error: "Please use a real email address" };
  }

  return { valid: true };
}

/**
 * Synchronous quick-check (no MX lookup) for immediate UI feedback
 */
export function isDisposableEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return true;
  return isDomainDisposable(domain);
}
