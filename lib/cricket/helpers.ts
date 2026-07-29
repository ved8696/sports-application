// Generic, domain-agnostic utilities: sorting, search matching, pagination.
// Used by the store and by table/list components -- never re-implemented locally.

export type SortDirection = "asc" | "desc";

export function compareValues(a: string | number, b: string | number, dir: SortDirection): number {
  let result: number;
  if (typeof a === "string" && typeof b === "string") {
    result = a.localeCompare(b);
  } else {
    result = (a as number) - (b as number);
  }
  return dir === "asc" ? result : -result;
}

export function sortByKey<T extends object>(items: T[], key: keyof T, dir: SortDirection): T[] {
  return [...items].sort((a, b) => compareValues(a[key] as string | number, b[key] as string | number, dir));
}

/** Case-insensitive substring match against any of the provided field values. */
export function matchesSearch(fields: Array<string | number | undefined | null>, query: string): boolean {
  if (!query.trim()) return true;
  const needle = query.trim().toLowerCase();
  return fields.some((field) => field !== undefined && field !== null && String(field).toLowerCase().includes(needle));
}

export interface Page<T> {
  rows: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export function paginate<T>(items: T[], page: number, pageSize: number): Page<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    rows: items.slice(start, start + pageSize),
    page: safePage,
    pageSize,
    total,
    totalPages,
  };
}

export function uniqueSorted(values: Array<string | undefined | null>): string[] {
  return Array.from(new Set(values.filter((v): v is string => Boolean(v)))).sort((a, b) => a.localeCompare(b));
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .join("")
    .toUpperCase();
}
