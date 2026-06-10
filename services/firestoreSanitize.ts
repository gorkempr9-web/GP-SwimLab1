type FirestoreSanitized =
  | string
  | number
  | boolean
  | null
  | Date
  | FirestoreSanitized[]
  | { [key: string]: FirestoreSanitized };

export function sanitizeForFirestore<T>(data: T): T {
  return sanitizeValue(data) as T;
}

function sanitizeValue(value: unknown): FirestoreSanitized | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
  if (value instanceof Date) return value;

  if (Array.isArray(value)) {
    return value
      .map((item) => sanitizeValue(item))
      .filter((item): item is FirestoreSanitized => item !== undefined);
  }

  if (typeof value === 'object') {
    const next: { [key: string]: FirestoreSanitized } = {};
    Object.entries(value as Record<string, unknown>).forEach(([key, item]) => {
      const sanitized = sanitizeValue(item);
      if (sanitized !== undefined) next[key] = sanitized;
    });
    return next;
  }

  return undefined;
}
