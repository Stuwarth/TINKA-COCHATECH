export function isValidISODate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function getDateRange(
  days: number,
  endDate: Date = new Date(),
): { start: Date; end: Date } {
  const end = new Date(endDate);
  const start = new Date(endDate);
  start.setDate(start.getDate() - days);

  return { start, end };
}

export function getDayName(date: Date): string {
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  return days[date.getDay()];
}
