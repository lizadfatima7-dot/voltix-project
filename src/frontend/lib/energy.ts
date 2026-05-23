// Deterministic mock data generators for energy analytics
export type Device = {
  id: string;
  user_id: string;
  name: string;
  type: string;
  watts: number;
  daily_hours: number;
  status: boolean;
  created_at: string;
  updated_at: string;
};

const COST_PER_KWH = 0.18; // USD
const CO2_PER_KWH = 0.42; // kg CO2

export const sampleDevices: Device[] = [
  { id: "sample-1", user_id: "sample", name: "Kondisioner", type: "ac", watts: 1200, daily_hours: 4, status: true, created_at: "2026-01-04T09:00:00Z", updated_at: "2026-05-15T22:30:00Z" },
  { id: "sample-2", user_id: "sample", name: "Soyuducu", type: "fridge", watts: 175, daily_hours: 12, status: true, created_at: "2026-01-08T09:00:00Z", updated_at: "2026-05-15T21:10:00Z" },
  { id: "sample-3", user_id: "sample", name: "Paltaryuyan maşın", type: "washer", watts: 850, daily_hours: 1.4, status: false, created_at: "2026-01-12T09:00:00Z", updated_at: "2026-05-15T18:40:00Z" },
  { id: "sample-4", user_id: "sample", name: "Qabyuyan maşın", type: "dishwasher", watts: 1100, daily_hours: 1.1, status: false, created_at: "2026-01-14T09:00:00Z", updated_at: "2026-05-15T19:20:00Z" },
  { id: "sample-5", user_id: "sample", name: "Televizor", type: "tv", watts: 240, daily_hours: 5, status: false, created_at: "2026-01-16T09:00:00Z", updated_at: "2026-05-15T20:00:00Z" },
  { id: "sample-6", user_id: "sample", name: "Wi-Fi Router", type: "router", watts: 21, daily_hours: 24, status: true, created_at: "2026-01-18T09:00:00Z", updated_at: "2026-05-15T22:45:00Z" },
  { id: "sample-7", user_id: "sample", name: "İşıqlar", type: "lights", watts: 180, daily_hours: 6, status: true, created_at: "2026-01-20T09:00:00Z", updated_at: "2026-05-15T22:05:00Z" },
  { id: "sample-8", user_id: "sample", name: "Elektrik sobası", type: "oven", watts: 2200, daily_hours: 0.9, status: false, created_at: "2026-01-22T09:00:00Z", updated_at: "2026-05-15T17:15:00Z" },
  { id: "sample-9", user_id: "sample", name: "Kompüter", type: "computer", watts: 420, daily_hours: 6.5, status: true, created_at: "2026-01-24T09:00:00Z", updated_at: "2026-05-15T22:25:00Z" },
  { id: "sample-10", user_id: "sample", name: "Laptop", type: "laptop", watts: 95, daily_hours: 7, status: true, created_at: "2026-01-26T09:00:00Z", updated_at: "2026-05-15T21:55:00Z" },
  { id: "sample-11", user_id: "sample", name: "Telefon şarj cihazı", type: "charger", watts: 18, daily_hours: 3, status: false, created_at: "2026-01-28T09:00:00Z", updated_at: "2026-05-15T16:30:00Z" },
  { id: "sample-12", user_id: "sample", name: "Mikrodalğalı soba", type: "microwave", watts: 1200, daily_hours: 0.35, status: false, created_at: "2026-01-30T09:00:00Z", updated_at: "2026-05-15T14:50:00Z" },
  { id: "sample-13", user_id: "sample", name: "Su qızdırıcısı", type: "heater", watts: 1800, daily_hours: 2.4, status: true, created_at: "2026-02-01T09:00:00Z", updated_at: "2026-05-15T22:20:00Z" },
  { id: "sample-14", user_id: "sample", name: "Ventilyator", type: "fan", watts: 70, daily_hours: 8, status: true, created_at: "2026-02-03T09:00:00Z", updated_at: "2026-05-15T22:15:00Z" },
  { id: "sample-15", user_id: "sample", name: "Təhlükəsizlik kameraları", type: "camera", watts: 55, daily_hours: 24, status: true, created_at: "2026-02-05T09:00:00Z", updated_at: "2026-05-15T22:40:00Z" },
];

export function getEffectiveDevices(devices: Device[]) {
  return devices.length > 0 ? devices : sampleDevices;
}

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function dailyKwh(d: Device) {
  return (d.watts * d.daily_hours) / 1000;
}

export function totalDailyKwh(devices: Device[]) {
  return getEffectiveDevices(devices).filter((d) => d.status).reduce((sum, d) => sum + dailyKwh(d), 0);
}

export function monthlyKwh(devices: Device[]) {
  return totalDailyKwh(devices) * 30;
}

export function monthlyCost(devices: Device[]) {
  return monthlyKwh(devices) * COST_PER_KWH;
}

export function monthlyCO2(devices: Device[]) {
  return monthlyKwh(devices) * CO2_PER_KWH;
}

export function generateHourly(devices: Device[]) {
  const source = getEffectiveDevices(devices);
  const rand = seededRandom(source.length * 7 + 11);
  const base = totalDailyKwh(source) / 24;
  return Array.from({ length: 24 }, (_, h) => {
    // Peak around 8am and 7-9pm
    const peak = Math.exp(-Math.pow(h - 8, 2) / 12) + 1.4 * Math.exp(-Math.pow(h - 20, 2) / 8);
    const noise = 0.8 + rand() * 0.4;
    return {
      hour: `${String(h).padStart(2, "0")}:00`,
      usage: Number((base * (0.6 + peak) * noise).toFixed(2)),
      voltage: Math.round(218 + rand() * 8),
    };
  });
}

export function generateDaily(devices: Device[], days = 30) {
  const source = getEffectiveDevices(devices);
  const rand = seededRandom(source.length * 13 + 3);
  const avg = totalDailyKwh(source);
  return Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    const variance = 0.7 + rand() * 0.6;
    return {
      date: date.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      kwh: Number((avg * variance).toFixed(2)),
      cost: Number((avg * variance * COST_PER_KWH).toFixed(2)),
    };
  });
}

export function generateMonthly(devices: Device[]) {
  const source = getEffectiveDevices(devices);
  const rand = seededRandom(source.length * 5 + 2);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const base = monthlyKwh(source);
  const now = new Date().getMonth();
  return months.map((m, i) => ({
    month: m,
    kwh: Number((base * (0.75 + rand() * 0.5)).toFixed(0)),
    isCurrent: i === now,
  }));
}

export function deviceBreakdown(devices: Device[]) {
  return getEffectiveDevices(devices)
    .filter((d) => d.status)
    .map((d) => ({ name: d.name, value: Number((dailyKwh(d) * 30).toFixed(1)), type: d.type }))
    .sort((a, b) => b.value - a.value);
}

export function aiRecommendations(devices: Device[]) {
  const source = getEffectiveDevices(devices);
  const recs: { title: string; description: string }[] = [];
  const breakdown = deviceBreakdown(source);
  const top = breakdown[0];
  if (top) {
    recs.push({
      title: `Your ${top.name} is the biggest energy consumer`,
      description: `It accounts for ~${top.value} kWh per month. Consider reducing usage during peak hours.`,
    });
  }
  const heavy = source.find((d) => /AC|Air|Heater/i.test(d.name + d.type) && d.daily_hours > 5);
  if (heavy) {
    recs.push({
      title: `${heavy.name} runs too long at night`,
      description: "Switch to a programmable schedule to limit nighttime operation.",
    });
  }
  const idle = source.filter((d) => !d.status).length;
  if (idle === 0 && source.length > 0) {
    recs.push({
      title: "All devices are active",
      description: "Turn off devices you aren't using to reduce standby drain.",
    });
  }
  recs.push({
    title: "Run laundry between 10pm – 6am",
    description: "Off-peak hours typically cost up to 30% less per kWh.",
  });
  return recs.slice(0, 4);
}

export const PRICING = { COST_PER_KWH, CO2_PER_KWH };
