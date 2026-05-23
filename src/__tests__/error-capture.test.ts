import { describe, it, expect, beforeEach, vi } from "vitest";
import { consumeLastCapturedError } from "@/lib/error-capture";

describe("error-capture.ts", () => {
  beforeEach(() => {
    // Clear any captured errors between tests
    consumeLastCapturedError();
  });

  describe("consumeLastCapturedError", () => {
    it("returns undefined when no error captured", () => {
      expect(consumeLastCapturedError()).toBeUndefined();
    });

    it("returns undefined on subsequent calls (consumes error)", () => {
      // Simulate an error event
      const error = new Error("Test error");
      globalThis.dispatchEvent(new ErrorEvent("error", { error }));
      
      // First call should return the error
      const captured = consumeLastCapturedError();
      expect(captured).toBe(error);
      
      // Second call should return undefined (consumed)
      expect(consumeLastCapturedError()).toBeUndefined();
    });

    it("captures error from error event", () => {
      const error = new Error("Captured error");
      globalThis.dispatchEvent(new ErrorEvent("error", { error }));
      
      expect(consumeLastCapturedError()).toBe(error);
    });

    it("captures reason from unhandledrejection event", () => {
      const reason = new Error("Unhandled rejection");
      globalThis.dispatchEvent(new PromiseRejectionEvent("unhandledrejection", {
        promise: Promise.reject(reason).catch(() => {}), // Prevent actual unhandled rejection
        reason,
      }));
      
      expect(consumeLastCapturedError()).toBe(reason);
    });

    it("captures non-Error values", () => {
      const stringError = "String error message";
      globalThis.dispatchEvent(new ErrorEvent("error", { error: stringError }));
      
      expect(consumeLastCapturedError()).toBe(stringError);
    });

    it("expires error after TTL (5 seconds)", async () => {
      vi.useFakeTimers();
      
      const error = new Error("Expiring error");
      globalThis.dispatchEvent(new ErrorEvent("error", { error }));
      
      // Advance time past TTL
      vi.advanceTimersByTime(6000);
      
      expect(consumeLastCapturedError()).toBeUndefined();
      
      vi.useRealTimers();
    });

    it("returns error within TTL window", async () => {
      vi.useFakeTimers();
      
      const error = new Error("Fresh error");
      globalThis.dispatchEvent(new ErrorEvent("error", { error }));
      
      // Advance time but stay within TTL
      vi.advanceTimersByTime(4000);
      
      expect(consumeLastCapturedError()).toBe(error);
      
      vi.useRealTimers();
    });

    it("overwrites previous error with new one", () => {
      const error1 = new Error("First error");
      const error2 = new Error("Second error");
      
      globalThis.dispatchEvent(new ErrorEvent("error", { error: error1 }));
      globalThis.dispatchEvent(new ErrorEvent("error", { error: error2 }));
      
      expect(consumeLastCapturedError()).toBe(error2);
    });
  });
});
