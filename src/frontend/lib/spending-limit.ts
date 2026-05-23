const DEFAULT_SPENDING_LIMIT_AZN = 50;

function keyFor(userId?: string) {
  return `voltx-spending-limit-azn-${userId ?? "guest"}`;
}

export function getSpendingLimit(userId?: string) {
  if (typeof window === "undefined") return DEFAULT_SPENDING_LIMIT_AZN;
  const stored = window.localStorage.getItem(keyFor(userId));
  const value = stored ? Number(stored) : DEFAULT_SPENDING_LIMIT_AZN;
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_SPENDING_LIMIT_AZN;
}

export function setSpendingLimit(userId: string | undefined, limit: number) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(keyFor(userId), String(limit));
  window.dispatchEvent(new CustomEvent("voltx-spending-limit-updated", { detail: { limit } }));
}
