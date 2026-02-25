export interface CategoryMeta {
  label: string;
  color: string;
  icon: string;
}

export const CATEGORIES: Record<string, CategoryMeta> = {
  'Solid Waste (Garbage) Related': {
    label: 'Garbage',
    color: '#16a34a',
    icon: '🗑️',
  },
  'Electrical': {
    label: 'Electrical / Streetlights',
    color: '#facc15',
    icon: '💡',
  },
  'Road Maintenance(Engg)': {
    label: 'Roads',
    color: '#f97316',
    icon: '🛣️',
  },
  'Revenue Department': {
    label: 'Revenue',
    color: '#818cf8',
    icon: '📋',
  },
  'Forest': {
    label: 'Forest / Trees',
    color: '#22c55e',
    icon: '🌳',
  },
  'Lakes': {
    label: 'Lakes',
    color: '#0ea5e9',
    icon: '💧',
  },
  'E khata / Khata services': {
    label: 'Khata Services',
    color: '#a78bfa',
    icon: '📜',
  },
};

export const CATEGORY_KEYS = Object.keys(CATEGORIES);
export const ALL_CATEGORY = 'All Categories';
