/**
 * Safe coercion for DB/UI values: never assumes `.trim` exists on unknown types.
 * Supabase may return numbers for columns the app types as `string | null`.
 */
export function trimStringish(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  return String(value).trim();
}

export function isNonEmptyStringish(value: unknown): boolean {
  return trimStringish(value) !== "";
}
