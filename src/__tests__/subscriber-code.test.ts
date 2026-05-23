import { describe, it, expect, beforeEach, vi } from "vitest";
import { normalizeSubscriberCode, getSubscriberCode, setSubscriberCode } from "@/lib/subscriber-code";

describe("subscriber-code.ts", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("normalizeSubscriberCode", () => {
    it("trims whitespace", () => {
      expect(normalizeSubscriberCode("  abc  ")).toBe("ABC");
    });

    it("removes internal spaces", () => {
      expect(normalizeSubscriberCode("AZE 123 456")).toBe("AZE123456");
    });

    it("converts to uppercase", () => {
      expect(normalizeSubscriberCode("aze-12345")).toBe("AZE-12345");
    });

    it("handles empty string", () => {
      expect(normalizeSubscriberCode("")).toBe("");
    });

    it("handles string with only whitespace", () => {
      expect(normalizeSubscriberCode("   ")).toBe("");
    });

    it("preserves special characters", () => {
      expect(normalizeSubscriberCode("aze-12/34")).toBe("AZE-12/34");
    });
  });

  describe("getSubscriberCode", () => {
    it("returns normalized metadata code when provided", () => {
      expect(getSubscriberCode("user-1", "aze-123")).toBe("AZE-123");
    });

    it("ignores empty/whitespace metadata", () => {
      setSubscriberCode("user-1", "stored-code");
      expect(getSubscriberCode("user-1", "   ")).toBe("STORED-CODE");
    });

    it("ignores non-string metadata", () => {
      setSubscriberCode("user-1", "stored-code");
      expect(getSubscriberCode("user-1", 12345)).toBe("STORED-CODE");
    });

    it("returns localStorage value when no metadata", () => {
      setSubscriberCode("user-1", "local-code");
      expect(getSubscriberCode("user-1")).toBe("LOCAL-CODE");
    });

    it("returns empty string when nothing stored", () => {
      expect(getSubscriberCode("user-99")).toBe("");
    });

    it("uses guest key when userId is undefined", () => {
      setSubscriberCode(undefined, "guest-code");
      expect(getSubscriberCode(undefined)).toBe("GUEST-CODE");
    });
  });

  describe("setSubscriberCode", () => {
    it("stores normalized code in localStorage", () => {
      setSubscriberCode("user-1", "aze 567");
      expect(localStorage.getItem("voltx-electricity-subscriber-code-user-1")).toBe("AZE567");
    });

    it("dispatches custom event", () => {
      const handler = vi.fn();
      window.addEventListener("voltx-subscriber-code-updated", handler);
      setSubscriberCode("user-1", "code-1");
      expect(handler).toHaveBeenCalledTimes(1);
      window.removeEventListener("voltx-subscriber-code-updated", handler);
    });

    it("event detail includes the code", () => {
      let detail: unknown;
      const handler = (e: Event) => { detail = (e as CustomEvent).detail; };
      window.addEventListener("voltx-subscriber-code-updated", handler);
      setSubscriberCode("user-1", "event-code");
      expect(detail).toEqual({ code: "event-code" });
      window.removeEventListener("voltx-subscriber-code-updated", handler);
    });
  });
});
