import { describe, it, expect } from "vitest";
import {
  dailyKwh,
  totalDailyKwh,
  monthlyKwh,
  monthlyCost,
  monthlyCO2,
  getEffectiveDevices,
  generateHourly,
  generateDaily,
  generateMonthly,
  deviceBreakdown,
  aiRecommendations,
  sampleDevices,
  PRICING,
  type Device,
} from "@/lib/energy";

// Helper to create a minimal device
function makeDevice(overrides: Partial<Device> = {}): Device {
  return {
    id: "test-1",
    user_id: "user-1",
    name: "Test Device",
    type: "other",
    watts: 100,
    daily_hours: 10,
    status: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("energy.ts", () => {
  describe("dailyKwh", () => {
    it("calculates basic kWh correctly", () => {
      const device = makeDevice({ watts: 1000, daily_hours: 5 });
      expect(dailyKwh(device)).toBe(5); // 1000W * 5h / 1000
    });

    it("returns 0 for device with 0 watts", () => {
      expect(dailyKwh(makeDevice({ watts: 0 }))).toBe(0);
    });

    it("returns 0 for device with 0 hours", () => {
      expect(dailyKwh(makeDevice({ daily_hours: 0 }))).toBe(0);
    });

    it("handles fractional hours", () => {
      const device = makeDevice({ watts: 2000, daily_hours: 0.5 });
      expect(dailyKwh(device)).toBe(1); // 2000 * 0.5 / 1000
    });

    it("handles very large wattage", () => {
      const device = makeDevice({ watts: 50000, daily_hours: 24 });
      expect(dailyKwh(device)).toBe(1200);
    });
  });

  describe("getEffectiveDevices", () => {
    it("returns provided devices when array is non-empty", () => {
      const devices = [makeDevice()];
      expect(getEffectiveDevices(devices)).toBe(devices);
    });

    it("returns sampleDevices when array is empty", () => {
      expect(getEffectiveDevices([])).toBe(sampleDevices);
    });

    it("sampleDevices has 15 items", () => {
      expect(sampleDevices).toHaveLength(15);
    });
  });

  describe("totalDailyKwh", () => {
    it("sums only active (status=true) devices", () => {
      const devices = [
        makeDevice({ watts: 1000, daily_hours: 10, status: true }),
        makeDevice({ id: "2", watts: 500, daily_hours: 4, status: false }),
      ];
      expect(totalDailyKwh(devices)).toBe(10); // only first device: 1000*10/1000
    });

    it("returns 0 if all devices inactive", () => {
      const devices = [makeDevice({ status: false })];
      // Falls back to sampleDevices since getEffective is called, but filter status=false on empty real array
      // Actually getEffectiveDevices returns provided devices since length > 0
      // Then filters by status, so only the inactive one => 0
      expect(totalDailyKwh(devices)).toBe(0);
    });

    it("uses sampleDevices when passed empty array", () => {
      const result = totalDailyKwh([]);
      expect(result).toBeGreaterThan(0);
    });
  });

  describe("monthlyKwh", () => {
    it("multiplies daily by 30", () => {
      const devices = [makeDevice({ watts: 1000, daily_hours: 10, status: true })];
      expect(monthlyKwh(devices)).toBe(300); // 10 kWh/day * 30
    });
  });

  describe("monthlyCost", () => {
    it("applies COST_PER_KWH rate", () => {
      const devices = [makeDevice({ watts: 1000, daily_hours: 10, status: true })];
      expect(monthlyCost(devices)).toBeCloseTo(300 * PRICING.COST_PER_KWH);
    });
  });

  describe("monthlyCO2", () => {
    it("applies CO2_PER_KWH rate", () => {
      const devices = [makeDevice({ watts: 1000, daily_hours: 10, status: true })];
      expect(monthlyCO2(devices)).toBeCloseTo(300 * PRICING.CO2_PER_KWH);
    });
  });

  describe("generateHourly", () => {
    it("returns 24 entries", () => {
      expect(generateHourly([])).toHaveLength(24);
    });

    it("each entry has hour, usage, and voltage fields", () => {
      const hourly = generateHourly([]);
      hourly.forEach((entry) => {
        expect(entry).toHaveProperty("hour");
        expect(entry).toHaveProperty("usage");
        expect(entry).toHaveProperty("voltage");
        expect(typeof entry.usage).toBe("number");
        expect(entry.voltage).toBeGreaterThanOrEqual(218);
        expect(entry.voltage).toBeLessThanOrEqual(226);
      });
    });

    it("is deterministic for same input", () => {
      const a = generateHourly([]);
      const b = generateHourly([]);
      expect(a).toEqual(b);
    });

    it("hours are formatted as HH:00", () => {
      const hourly = generateHourly([]);
      expect(hourly[0].hour).toBe("00:00");
      expect(hourly[23].hour).toBe("23:00");
    });
  });

  describe("generateDaily", () => {
    it("returns 30 entries by default", () => {
      expect(generateDaily([])).toHaveLength(30);
    });

    it("respects custom days param", () => {
      expect(generateDaily([], 7)).toHaveLength(7);
    });

    it("each entry has date, kwh, cost", () => {
      generateDaily([], 5).forEach((entry) => {
        expect(entry).toHaveProperty("date");
        expect(entry).toHaveProperty("kwh");
        expect(entry).toHaveProperty("cost");
        expect(entry.kwh).toBeGreaterThan(0);
        expect(entry.cost).toBeGreaterThan(0);
      });
    });

    it("is deterministic", () => {
      expect(generateDaily([], 5)).toEqual(generateDaily([], 5));
    });
  });

  describe("generateMonthly", () => {
    it("returns 12 entries", () => {
      expect(generateMonthly([])).toHaveLength(12);
    });

    it("marks current month with isCurrent", () => {
      const monthly = generateMonthly([]);
      const currentCount = monthly.filter((m) => m.isCurrent).length;
      expect(currentCount).toBe(1);
    });

    it("all kwh values are positive", () => {
      generateMonthly([]).forEach((entry) => {
        expect(entry.kwh).toBeGreaterThan(0);
      });
    });
  });

  describe("deviceBreakdown", () => {
    it("only includes active devices", () => {
      const devices = [
        makeDevice({ name: "Active", status: true }),
        makeDevice({ id: "2", name: "Inactive", status: false }),
      ];
      const result = deviceBreakdown(devices);
      expect(result.every((d) => d.name !== "Inactive")).toBe(true);
    });

    it("sorts by value descending", () => {
      const devices = [
        makeDevice({ name: "Low", watts: 50, daily_hours: 1, status: true }),
        makeDevice({ id: "2", name: "High", watts: 2000, daily_hours: 10, status: true }),
      ];
      const result = deviceBreakdown(devices);
      expect(result[0].name).toBe("High");
    });

    it("returns empty array if no active devices", () => {
      const devices = [makeDevice({ status: false })];
      expect(deviceBreakdown(devices)).toEqual([]);
    });
  });

  describe("aiRecommendations", () => {
    it("always returns at most 4 recommendations", () => {
      expect(aiRecommendations([]).length).toBeLessThanOrEqual(4);
    });

    it("always includes laundry tip", () => {
      const recs = aiRecommendations([]);
      expect(recs.some((r) => r.title.includes("laundry"))).toBe(true);
    });

    it("identifies top energy consumer", () => {
      const recs = aiRecommendations([]);
      expect(recs.some((r) => r.title.includes("biggest energy consumer"))).toBe(true);
    });

    it("handles empty device list gracefully", () => {
      // uses sampleDevices, should not throw
      expect(() => aiRecommendations([])).not.toThrow();
    });

    it("detects all-active scenario", () => {
      const allActive = sampleDevices.map((d) => ({ ...d, status: true }));
      const recs = aiRecommendations(allActive);
      expect(recs.some((r) => r.title.includes("All devices are active"))).toBe(true);
    });
  });

  describe("PRICING constants", () => {
    it("exports valid cost per kWh", () => {
      expect(PRICING.COST_PER_KWH).toBe(0.18);
    });
    it("exports valid CO2 per kWh", () => {
      expect(PRICING.CO2_PER_KWH).toBe(0.42);
    });
  });
});
