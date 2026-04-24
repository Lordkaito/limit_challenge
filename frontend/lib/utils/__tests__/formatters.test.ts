import {
  STATUS_META,
  PRIORITY_META,
  formatRelativeDate,
  formatDate,
  formatDateTime,
} from '../formatters';

describe('STATUS_META', () => {
  it('has entries for all statuses', () => {
    expect(STATUS_META.new).toBeDefined();
    expect(STATUS_META.in_review).toBeDefined();
    expect(STATUS_META.closed).toBeDefined();
    expect(STATUS_META.lost).toBeDefined();
  });

  it('each entry has label and color', () => {
    Object.values(STATUS_META).forEach((meta) => {
      expect(typeof meta.label).toBe('string');
      expect(meta.color).toBeDefined();
    });
  });
});

describe('PRIORITY_META', () => {
  it('has entries for all priorities', () => {
    expect(PRIORITY_META.high).toBeDefined();
    expect(PRIORITY_META.medium).toBeDefined();
    expect(PRIORITY_META.low).toBeDefined();
  });
});

describe('formatRelativeDate', () => {
  it('returns Today for current date', () => {
    const now = new Date().toISOString();
    expect(formatRelativeDate(now)).toBe('Today');
  });

  it('returns Yesterday for 1 day ago', () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString();
    expect(formatRelativeDate(yesterday)).toBe('Yesterday');
  });

  it('returns Xd ago for recent days', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString();
    expect(formatRelativeDate(threeDaysAgo)).toBe('3d ago');
  });
});

describe('formatDate', () => {
  it('returns a formatted date string', () => {
    const result = formatDate('2025-06-15T00:00:00Z');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('formatDateTime', () => {
  it('returns a formatted datetime string', () => {
    const result = formatDateTime('2025-06-15T14:30:00Z');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});
