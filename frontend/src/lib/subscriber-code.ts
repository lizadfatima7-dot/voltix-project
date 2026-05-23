function keyFor(userId?: string) {
  return `voltx-electricity-subscriber-code-${userId ?? "guest"}`;
}

export function normalizeSubscriberCode(value: string) {
  return value.trim().replace(/\s+/g, "").toUpperCase();
}

export function getSubscriberCode(userId?: string, metadataCode?: unknown) {
  if (typeof metadataCode === "string" && metadataCode.trim()) return normalizeSubscriberCode(metadataCode);
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(keyFor(userId)) ?? "";
}

export function setSubscriberCode(userId: string | undefined, code: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(keyFor(userId), normalizeSubscriberCode(code));
  window.dispatchEvent(new CustomEvent("voltx-subscriber-code-updated", { detail: { code } }));
}
