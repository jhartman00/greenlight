import type { ElementCategory } from '../types/scheduling';

export function getStripColor(intExt: string, dayNight: string): string {
  return getStripColors(intExt, dayNight).bg;
}

export function getStripColors(intExt: string, dayNight: string): { bg: string; text: string; stripe?: string } {
  if (dayNight === 'DAWN') return { bg: '#fdba74', text: '#111827' };
  if (dayNight === 'DUSK') return { bg: '#a855f7', text: '#ffffff' };

  if (intExt === 'INT') {
    if (dayNight === 'DAY') return { bg: '#ffffff', text: '#111827' };
    if (dayNight === 'NIGHT') return { bg: '#2563eb', text: '#ffffff' };
  }
  if (intExt === 'EXT') {
    if (dayNight === 'DAY') return { bg: '#facc15', text: '#111827' };
    if (dayNight === 'NIGHT') return { bg: '#15803d', text: '#ffffff' };
  }
  if (intExt === 'INT/EXT') {
    if (dayNight === 'DAY') return { bg: '#ffffff', text: '#111827', stripe: '#facc15' };
    if (dayNight === 'NIGHT') return { bg: '#2563eb', text: '#ffffff', stripe: '#15803d' };
  }
  return { bg: '#6b7280', text: '#ffffff' };
}

export function getStripClass(intExt: string, dayNight: string): string {
  if (dayNight === 'DAWN') return 'bg-orange-300 text-gray-900';
  if (dayNight === 'DUSK') return 'bg-purple-500 text-white';
  if (intExt === 'INT') {
    if (dayNight === 'DAY') return 'bg-white text-gray-900';
    if (dayNight === 'NIGHT') return 'bg-blue-600 text-white';
  }
  if (intExt === 'EXT') {
    if (dayNight === 'DAY') return 'bg-yellow-400 text-gray-900';
    if (dayNight === 'NIGHT') return 'bg-green-700 text-white';
  }
  if (intExt === 'INT/EXT') {
    if (dayNight === 'DAY') return 'bg-white text-gray-900';
    if (dayNight === 'NIGHT') return 'bg-blue-600 text-white';
  }
  return 'bg-gray-500 text-white';
}

export function getCategoryColor(category: ElementCategory): string {
  const colorMap: Record<ElementCategory, string> = {
    'Cast': 'bg-red-600 text-white',
    'Extras': 'bg-orange-500 text-white',
    'Stunts': 'bg-red-800 text-white',
    'Vehicles': 'bg-blue-500 text-white',
    'Props': 'bg-purple-600 text-white',
    'Wardrobe': 'bg-yellow-600 text-white',
    'Makeup/Hair': 'bg-pink-500 text-white',
    'Livestock/Animals': 'bg-green-600 text-white',
    'Sound Effects/Music': 'bg-indigo-500 text-white',
    'Special Effects': 'bg-cyan-600 text-white',
    'Special Equipment': 'bg-teal-600 text-white',
    'Art Department': 'bg-lime-600 text-white',
    'Set Dressing': 'bg-emerald-600 text-white',
    'Greenery': 'bg-green-700 text-white',
    'Visual Effects': 'bg-violet-600 text-white',
    'Mechanical Effects': 'bg-slate-500 text-white',
    'Miscellaneous': 'bg-gray-500 text-white',
    'Notes': 'bg-amber-500 text-white',
    'Security': 'bg-zinc-600 text-white',
  };
  return colorMap[category] || 'bg-gray-500 text-white';
}

export const ELEMENT_CATEGORY_COLORS: Record<ElementCategory, string> = {
  'Cast': '#dc2626',
  'Extras': '#f97316',
  'Stunts': '#991b1b',
  'Vehicles': '#3b82f6',
  'Props': '#9333ea',
  'Wardrobe': '#ca8a04',
  'Makeup/Hair': '#ec4899',
  'Livestock/Animals': '#16a34a',
  'Sound Effects/Music': '#6366f1',
  'Special Effects': '#0891b2',
  'Special Equipment': '#0d9488',
  'Art Department': '#65a30d',
  'Set Dressing': '#059669',
  'Greenery': '#15803d',
  'Visual Effects': '#7c3aed',
  'Mechanical Effects': '#64748b',
  'Miscellaneous': '#6b7280',
  'Notes': '#f59e0b',
  'Security': '#52525b',
};

export function getCategoryBgHex(category: ElementCategory): string {
  const hexMap: Record<ElementCategory, string> = {
    'Cast': '#dc2626',
    'Extras': '#f97316',
    'Stunts': '#991b1b',
    'Vehicles': '#3b82f6',
    'Props': '#9333ea',
    'Wardrobe': '#ca8a04',
    'Makeup/Hair': '#ec4899',
    'Livestock/Animals': '#16a34a',
    'Sound Effects/Music': '#6366f1',
    'Special Effects': '#0891b2',
    'Special Equipment': '#0d9488',
    'Art Department': '#65a30d',
    'Set Dressing': '#059669',
    'Greenery': '#15803d',
    'Visual Effects': '#7c3aed',
    'Mechanical Effects': '#64748b',
    'Miscellaneous': '#6b7280',
    'Notes': '#f59e0b',
    'Security': '#52525b',
  };
  return hexMap[category] || '#6b7280';
}
