import { describe, it, expect, beforeEach, vi } from "vitest";
import { getSpendingLimit, setSpendingLimit } from "@/lib/spending-limit";

describe("spending-limit.ts", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("getSpendingLimit", () => {
    it("returns default 50 when nothing stored", () => {
      expect(getSpendingLimit("user-1")).toBe(50);
    });

    it("returns stored value", () => {
      setSpendingLimit("user-1", 100);
      expect(getSpendingLimit("user-1")).toBe(100);
    });

    it("returns default for non-numeric stored value", () => {
      localStorage.setItem("voltx-spending-limit-azn-user-1", "abc");
      expect(getSpendingLimit("user-1")).toBe(50);
    });

    it("returns default for zero value", () => {
      localStorage.setItem("voltx-spending-limit-azn-user-1", "0");
      expect(getSpendingLimit("user-1")).toBe(50);
    });

    it("returns default for negative value", () => {
      localStorage.setItem("voltx-spending-limit-azn-user-1", "-10");
      expect(getSpendingLimit("user-1")).toBe(50);
    });

    it("returns default for Infinity", () => {
      localStorage.setItem("voltx-spending-limit-azn-user-1", "Infinity");
      expect(getSpendingLimit("user-1")).toBe(50);
    });

    it("returns default for NaN", () => {
      localStorage.setItem("voltx-spending-limit-azn-user-1", "NaN");
      expect(getSpendingLimit("user-1")).toBe(50);
    });

    it("uses guest key when userId undefined", () => {
      setSpendingLimit(undefined, 75);
      expect(getSpendingLimit(undefined)).toBe(75);
    });

    it("handles very large limit values", () => {
      setSpendingLimit("user-1", 999999);
      expect(getSpendingLimit("user-1")).toBe(999999);
    });

    it("handles fractional limits", () => {
      setSpendingLimit("user-1", 49.99);
      expect(getSpendingLimit("user-1")).toBe(49.99);
    });
  });

  describe("setSpendingLimit", () => {
    it("stores value as string in localStorage", () => {
      setSpendingLimit("user-1", 200);
      expect(localStorage.getItem("voltx-spending-limit-azn-user-1")).toBe("200");
    });

    it("dispatches custom event", () => {
      const handler = vi.fn();
      window.addEventListener("voltx-spending-limit-updated", handler);
      setSpendingLimit("user-1", 80);
      expect(handler).toHaveBeenCalledTimes(1);
      window.removeEventListener("voltx-spending-limit-updated", handler);
    });

    it("event detail contains the limit", () => {
      let detail: unknown;
      const handler = (e: Event) => { detail = (e as CustomEvent).detail; };
      window.addEventListener("voltx-spending-limit-updated", handler);
      setSpendingLimit("user-1", 120);
      expect(detail).toEqual({ limit: 120 });
      window.removeEventListener("voltx-spending-limit-updated", handler);
    });
  });
});
