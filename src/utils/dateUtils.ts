import { BlockType, SemesterConfig } from '../types';

/**
 * Parses various date strings into an ISO 'YYYY-MM-DD' formatted string.
 * Supports:
 * - DD/MM/YYYY or DD-MM-YYYY (common in Vietnamese education files)
 * - YYYY-MM-DD or YYYY/MM/DD
 * - Excel serial date numbers (e.g., 46279)
 * - Dates with timestamps (e.g., '14/09/2026 08:00:00')
 */
export function parseDateToIso(dateVal: any): string | null {
  if (dateVal === null || dateVal === undefined || dateVal === '') {
    return null;
  }

  // Handle number (Excel serial timestamp)
  if (typeof dateVal === 'number' && dateVal > 20000 && dateVal < 80000) {
    const excelEpoch = new Date(1899, 11, 30);
    const date = new Date(excelEpoch.getTime() + dateVal * 86400000);
    if (!isNaN(date.getTime())) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  }

  const str = String(dateVal).trim();
  if (!str) return null;

  // Split out timestamp if present e.g. "14/09/2026 07:30:00" -> "14/09/2026"
  const dateOnlyPart = str.split(' ')[0].split('T')[0];

  // Check DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = dateOnlyPart.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }

  // Check YYYY-MM-DD or YYYY/MM/DD
  const ymdMatch = dateOnlyPart.match(/^(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})$/);
  if (ymdMatch) {
    const year = ymdMatch[1];
    const month = ymdMatch[2].padStart(2, '0');
    const day = ymdMatch[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Try standard Date.parse
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  return null;
}

/**
 * Determine whether a given date belongs to Block 1 or Block 2
 * Default rules:
 * - 2026-09-14 to 2026-11-01 => Block 1
 * - 2026-11-02 to 2027-01-03 => Block 2
 */
export function determineBlockFromDate(
  dateVal: any,
  config: SemesterConfig,
  classCodeFallback?: string
): BlockType {
  const isoDate = parseDateToIso(dateVal);

  if (isoDate) {
    if (isoDate >= config.block1Start && isoDate <= config.block1End) {
      return 'B1';
    }
    if (isoDate >= config.block2Start && isoDate <= config.block2End) {
      return 'B2';
    }
    // If before B2 start, closer to B1
    if (isoDate < config.block2Start) {
      return 'B1';
    }
    return 'B2';
  }

  // Fallback from class code if date is missing (e.g., class code has .B1 or .B2 or _B1 or _B2)
  if (classCodeFallback) {
    const upper = classCodeFallback.toUpperCase();
    if (upper.includes('B2') || upper.includes('.2') || upper.includes('_2')) {
      return 'B2';
    }
    if (upper.includes('B1') || upper.includes('.1') || upper.includes('_1')) {
      return 'B1';
    }
  }

  return 'B1';
}
