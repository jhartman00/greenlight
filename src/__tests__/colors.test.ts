import {
  getStripColor,
  getStripColors,
  getStripClass,
  getCategoryColor,
  getCategoryBgHex,
  ELEMENT_CATEGORY_COLORS,
} from '../utils/colors';
import type { ElementCategory } from '../types/scheduling';

const ALL_CATEGORIES: ElementCategory[] = [
  'Cast', 'Extras', 'Stunts', 'Vehicles', 'Props',
  'Wardrobe', 'Makeup/Hair', 'Livestock/Animals',
  'Sound Effects/Music', 'Special Effects', 'Special Equipment',
  'Art Department', 'Set Dressing', 'Greenery',
  'Visual Effects', 'Mechanical Effects', 'Miscellaneous',
  'Notes', 'Security',
];

// ── getStripColors ────────────────────────────────────────────────────────────

describe('getStripColors', () => {
  it('DAWN returns orange background', () => {
    const result = getStripColors('INT', 'DAWN');
    expect(result.bg).toBe('#fdba74');
    expect(result.text).toBe('#111827');
  });

  it('DUSK returns purple background', () => {
    const result = getStripColors('INT', 'DUSK');
    expect(result.bg).toBe('#a855f7');
    expect(result.text).toBe('#ffffff');
  });

  it('INT DAY returns white background', () => {
    const result = getStripColors('INT', 'DAY');
    expect(result.bg).toBe('#ffffff');
    expect(result.text).toBe('#111827');
  });

  it('INT NIGHT returns blue background', () => {
    const result = getStripColors('INT', 'NIGHT');
    expect(result.bg).toBe('#2563eb');
    expect(result.text).toBe('#ffffff');
  });

  it('EXT DAY returns yellow background', () => {
    const result = getStripColors('EXT', 'DAY');
    expect(result.bg).toBe('#facc15');
    expect(result.text).toBe('#111827');
  });

  it('EXT NIGHT returns green background', () => {
    const result = getStripColors('EXT', 'NIGHT');
    expect(result.bg).toBe('#15803d');
    expect(result.text).toBe('#ffffff');
  });

  it('INT/EXT DAY returns white + yellow stripe', () => {
    const result = getStripColors('INT/EXT', 'DAY');
    expect(result.bg).toBe('#ffffff');
    expect(result.stripe).toBe('#facc15');
  });

  it('INT/EXT NIGHT returns blue + green stripe', () => {
    const result = getStripColors('INT/EXT', 'NIGHT');
    expect(result.bg).toBe('#2563eb');
    expect(result.stripe).toBe('#15803d');
  });

  it('unknown combination returns gray fallback', () => {
    const result = getStripColors('UNKNOWN', 'UNKNOWN');
    expect(result.bg).toBe('#6b7280');
    expect(result.text).toBe('#ffffff');
  });
});

// ── getStripColor ─────────────────────────────────────────────────────────────

describe('getStripColor', () => {
  it('returns the bg color from getStripColors', () => {
    expect(getStripColor('INT', 'DAY')).toBe('#ffffff');
    expect(getStripColor('EXT', 'DAY')).toBe('#facc15');
    expect(getStripColor('INT', 'NIGHT')).toBe('#2563eb');
    expect(getStripColor('EXT', 'NIGHT')).toBe('#15803d');
    expect(getStripColor('INT', 'DAWN')).toBe('#fdba74');
    expect(getStripColor('INT', 'DUSK')).toBe('#a855f7');
  });
});

// ── getStripClass ─────────────────────────────────────────────────────────────

describe('getStripClass', () => {
  it('DAWN returns orange tailwind class', () => {
    expect(getStripClass('INT', 'DAWN')).toContain('bg-orange');
  });

  it('DUSK returns purple tailwind class', () => {
    expect(getStripClass('INT', 'DUSK')).toContain('bg-purple');
  });

  it('INT DAY returns white background class', () => {
    expect(getStripClass('INT', 'DAY')).toContain('bg-white');
    expect(getStripClass('INT', 'DAY')).toContain('text-gray');
  });

  it('INT NIGHT returns blue background class', () => {
    expect(getStripClass('INT', 'NIGHT')).toContain('bg-blue');
    expect(getStripClass('INT', 'NIGHT')).toContain('text-white');
  });

  it('EXT DAY returns yellow background class', () => {
    expect(getStripClass('EXT', 'DAY')).toContain('bg-yellow');
  });

  it('EXT NIGHT returns green background class', () => {
    expect(getStripClass('EXT', 'NIGHT')).toContain('bg-green');
  });

  it('unknown combination returns gray fallback class', () => {
    expect(getStripClass('UNKNOWN', 'UNKNOWN')).toContain('bg-gray');
  });
});

// ── getCategoryColor ──────────────────────────────────────────────────────────

describe('getCategoryColor', () => {
  it('returns a CSS class string for all categories', () => {
    for (const category of ALL_CATEGORIES) {
      const result = getCategoryColor(category);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    }
  });

  it('Cast returns red class', () => {
    expect(getCategoryColor('Cast')).toContain('red');
  });

  it('Props returns purple class', () => {
    expect(getCategoryColor('Props')).toContain('purple');
  });

  it('Vehicles returns blue class', () => {
    expect(getCategoryColor('Vehicles')).toContain('blue');
  });
});

// ── getCategoryBgHex ──────────────────────────────────────────────────────────

describe('getCategoryBgHex', () => {
  it('returns a hex color string for all categories', () => {
    for (const category of ALL_CATEGORIES) {
      const result = getCategoryBgHex(category);
      expect(result).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('returns hex fallback for unknown category', () => {
    const result = getCategoryBgHex('Unknown' as ElementCategory);
    expect(result).toMatch(/^#[0-9a-f]{6}$/i);
  });
});

// ── ELEMENT_CATEGORY_COLORS ───────────────────────────────────────────────────

describe('ELEMENT_CATEGORY_COLORS', () => {
  it('contains an entry for every element category', () => {
    for (const category of ALL_CATEGORIES) {
      expect(ELEMENT_CATEGORY_COLORS).toHaveProperty(category);
    }
  });

  it('every value is a valid hex color', () => {
    for (const color of Object.values(ELEMENT_CATEGORY_COLORS)) {
      expect(color).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});
