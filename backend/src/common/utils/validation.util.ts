import { isValidISODate } from './date-range.util';

export function validateDateRange(from: string, to: string): boolean {
  if (!isValidISODate(from) || !isValidISODate(to)) {
    return false;
  }

  const fromDate = new Date(from);
  const toDate = new Date(to);

  return fromDate <= toDate;
}

export function parseDateRange(from?: string, to?: string) {
  const now = new Date();
  const end = to ? new Date(to) : now;
  const start = from ? new Date(from) : new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  return { start, end };
}

